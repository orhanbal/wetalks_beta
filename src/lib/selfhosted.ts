import SuperTokens from 'supertokens-web-js';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword';
import Session from 'supertokens-web-js/recipe/session';
import type {
  UserRole,
  Article,
  UserProfile,
  Comment,
  Notification,
  ArticleSeries,
  SystemSettings,
  Category,
  CalendarEvent,
} from '../types';

const AUTH_API_DOMAIN = 'https://auth.webrising.tr';
const DATA_BASE = AUTH_API_DOMAIN + '/data/wetalks';

let initialized = false;
let cachedIdentity: { id: string; email: string | null } | null = null;
const authListeners = new Set<(user: User | null) => void>();
const collectionCache = new Map<string, any[]>();

export type IdTokenResult = {
  claims: Record<string, unknown>;
};

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  getIdToken: () => Promise<string>;
  getIdTokenResult: () => Promise<IdTokenResult>;
};

export const db = { provider: 'self-hosted-postgresql' } as const;
export const auth: { currentUser: User | null } = { currentUser: null };
export const googleProvider = null;

function ensureAuth() {
  if (initialized || typeof window === 'undefined') return;
  SuperTokens.init({
    appInfo: {
      appName: 'WeTalks',
      apiDomain: AUTH_API_DOMAIN,
      apiBasePath: '/auth',
    },
    recipeList: [EmailPassword.init(), Session.init()],
  });
  initialized = true;
}

async function getAccessToken(): Promise<string> {
  ensureAuth();
  if (!(await Session.doesSessionExist())) return '';
  return (await Session.getAccessToken()) || '';
}

async function apiRequest(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const token = await getAccessToken().catch(() => '');
  if (token) headers.set('Authorization', 'Bearer ' + token);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(DATA_BASE + path, { ...init, headers });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const err: any = new Error(text || ('HTTP ' + response.status));
    err.status = response.status;
    err.code = response.status === 401 || response.status === 403 ? 'permission-denied' : String(response.status);
    throw err;
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function slugify(value: string) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function roleFromDb(role: unknown): UserRole {
  const r = String(role || '').toLowerCase();
  if (r === 'admin') return 'Admin';
  if (r === 'editor') return 'Editor';
  if (r === 'author' || r === 'writer') return 'Writer';
  return 'Reader';
}

function roleToDb(role: unknown): string {
  const r = String(role || '').toLowerCase();
  if (r === 'admin') return 'admin';
  if (r === 'editor') return 'editor';
  if (r === 'writer' || r === 'author') return 'author';
  return 'reader';
}

async function fetchProfile(id: string) {
  if (!isUuid(id)) return null;
  try {
    const rows = await apiRequest('/profiles?id=eq.' + encodeURIComponent(id) + '&select=*');
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  } catch {
    return null;
  }
}

async function resolveRole(id: string): Promise<UserRole> {
  const profile = await fetchProfile(id);
  return roleFromDb(profile?.role);
}

async function syncIdentity(displayName?: string): Promise<User | null> {
  ensureAuth();
  if (!(await Session.doesSessionExist())) {
    cachedIdentity = null;
    auth.currentUser = null;
    return null;
  }

  const token = await getAccessToken();
  if (!token) return null;

  const response = await fetch(AUTH_API_DOMAIN + '/identity/sync/wetalks', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(displayName ? { displayName } : {}),
  });
  if (!response.ok) throw new Error('Kimlik eşlemesi başarısız oldu.');

  const body = await response.json();
  cachedIdentity = {
    id: String(body.user_id),
    email: body.email || null,
  };

  const profile = await fetchProfile(cachedIdentity.id);
  const user = buildUser(cachedIdentity.id, cachedIdentity.email, profile);
  auth.currentUser = user;
  return user;
}

function buildUser(id: string, email: string | null, profile?: any): User {
  return {
    uid: id,
    email,
    displayName: profile?.full_name || email?.split('@')[0] || null,
    photoURL: profile?.avatar_url || null,
    getIdToken: async () => getAccessToken(),
    getIdTokenResult: async () => {
      const role = await resolveRole(id);
      return {
        claims: {
          role,
          admin: role === 'Admin',
          editor: role === 'Editor',
          writer: role === 'Writer',
          reader: role === 'Reader',
        },
      };
    },
  };
}

async function notifyAuth() {
  const user = await syncIdentity().catch(() => null);
  for (const cb of authListeners) {
    try { cb(user); } catch {}
  }
}

export async function signInWithEmailAndPassword(_auth: typeof auth, email: string, password: string) {
  ensureAuth();
  const result: any = await EmailPassword.signIn({
    formFields: [
      { id: 'email', value: email.trim().toLowerCase() },
      { id: 'password', value: password },
    ],
  });
  if (result.status !== 'OK') {
    const err: any = new Error('E-posta veya şifre hatalı.');
    err.code = 'auth/invalid-credential';
    throw err;
  }
  cachedIdentity = null;
  const user = await syncIdentity();
  if (!user) throw new Error('Oturum oluşturulamadı.');
  await notifyAuth();
  return { user };
}

export async function createUserWithEmailAndPassword(_auth: typeof auth, email: string, password: string) {
  ensureAuth();
  const result: any = await EmailPassword.signUp({
    formFields: [
      { id: 'email', value: email.trim().toLowerCase() },
      { id: 'password', value: password },
    ],
  });
  if (result.status !== 'OK') {
    const message = result.status === 'FIELD_ERROR'
      ? (result.formFields?.[0]?.error || 'Kayıt bilgileri geçersiz.')
      : 'Bu e-posta adresi zaten kayıtlı olabilir.';
    const err: any = new Error(message);
    err.code = 'auth/email-already-in-use';
    throw err;
  }
  cachedIdentity = null;
  const user = await syncIdentity(email.split('@')[0]);
  if (!user) throw new Error('Kullanıcı oluşturuldu fakat oturum açılamadı.');
  await notifyAuth();
  return { user };
}

export async function signOut(_auth: typeof auth) {
  ensureAuth();
  await Session.signOut();
  cachedIdentity = null;
  auth.currentUser = null;
  for (const cb of authListeners) {
    try { cb(null); } catch {}
  }
}

export function onAuthStateChanged(_auth: typeof auth, callback: (user: User | null) => void) {
  ensureAuth();
  let active = true;
  authListeners.add(callback);

  void syncIdentity()
    .then(user => { if (active) callback(user); })
    .catch(() => { if (active) callback(null); });

  const focusHandler = () => {
    void syncIdentity().then(user => {
      if (active) callback(user);
    }).catch(() => {
      if (active) callback(null);
    });
  };
  if (typeof window !== 'undefined') window.addEventListener('focus', focusHandler);

  return () => {
    active = false;
    authListeners.delete(callback);
    if (typeof window !== 'undefined') window.removeEventListener('focus', focusHandler);
  };
}

export async function sendPasswordResetEmail(_auth: typeof auth, email: string) {
  ensureAuth();
  const result: any = await EmailPassword.sendPasswordResetEmail({
    formFields: [{ id: 'email', value: email.trim().toLowerCase() }],
  });
  if (result.status !== 'OK') {
    const err: any = new Error(result.formFields?.[0]?.error || 'Şifre sıfırlama e-postası gönderilemedi.');
    err.code = 'auth/password-reset-failed';
    throw err;
  }
}

export async function signInWithPopup(..._args: unknown[]) {
  const err: any = new Error('Google ile giriş self-hosted kimlik altyapısında henüz etkin değil.');
  err.code = 'auth/provider-not-configured';
  throw err;
}

export function extractRoleFromClaims(tokenResult: IdTokenResult | null): UserRole {
  if (!tokenResult?.claims) return 'Reader';
  const role = tokenResult.claims.role;
  if (role === 'Admin' || tokenResult.claims.admin === true) return 'Admin';
  if (role === 'Editor' || tokenResult.claims.editor === true) return 'Editor';
  if (role === 'Writer' || tokenResult.claims.writer === true) return 'Writer';
  return 'Reader';
}

export function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanUndefined);
  if (typeof obj === 'object') {
    const out: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) out[key] = cleanUndefined(value);
    }
    return out;
  }
  return obj;
}

function fromDbArticle(row: any): Article {
  const categoryId = slugify(row.category || 'gundem') || 'gundem';
  return {
    id: String(row.id),
    title: row.title || '',
    summary: row.excerpt || '',
    content: row.content || '',
    coverImage: row.og_image || '',
    authorId: row.author_id || 'user_orhan',
    authorName: row.author_id ? 'WeTalks Yazarı' : 'Orhan Balcı',
    authorAvatar: '',
    categoryId,
    tags: [],
    createdAt: row.created_at || (row.date ? new Date(row.date + 'T12:00:00Z').toISOString() : new Date().toISOString()),
    readTime: Number(row.reading_time || 5),
    status: row.published === false ? 'Draft' : 'Published',
    views: 0,
    likes: 0,
    seriesId: row.series_id || undefined,
    publicationType: categoryId === 'gundem' || ['amazon','trendyol','hepsiburada','temu','etsy'].includes(categoryId) ? 'news' : (row.series_id ? 'series' : 'article'),
  };
}

function toDbArticle(item: any) {
  const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();
  const date = Number.isNaN(createdAt.getTime()) ? new Date().toISOString().slice(0, 10) : createdAt.toISOString().slice(0, 10);
  return cleanUndefined({
    id: String(item.id),
    title: item.title || '',
    category: item.categoryId || 'gundem',
    series_id: item.seriesId || null,
    series_title: null,
    date,
    excerpt: item.summary || '',
    reading_time: Number(item.readTime || 5),
    content: item.content || '',
    published: item.status === 'Published',
    og_image: item.coverImage || null,
    featured: false,
    author_id: isUuid(item.authorId) ? item.authorId : null,
    members_only: false,
    boosted: false,
    updated_at: new Date().toISOString(),
  });
}

function fromDbProfile(row: any): UserProfile {
  return {
    id: String(row.id),
    username: row.username || String(row.id),
    name: row.full_name || 'WeTalks Kullanıcısı',
    email: '',
    avatar: row.avatar_url || '',
    bio: row.bio || '',
    expertise: row.title ? [row.title] : [],
    socials: {
      twitter: row.twitter || undefined,
      linkedin: row.linkedin || undefined,
      website: row.website || undefined,
    },
    followersCount: 0,
    articlesCount: 0,
    role: roleFromDb(row.role),
    followedAuthors: [],
    savedArticles: [],
    likedArticles: [],
  };
}

function toDbProfile(item: any) {
  return cleanUndefined({
    id: item.id,
    full_name: item.name || '',
    avatar_url: item.avatar || null,
    role: roleToDb(item.role),
    bio: item.bio || '',
    title: Array.isArray(item.expertise) ? item.expertise.slice(0, 3).join(', ') : '',
    twitter: item.socials?.twitter || '',
    linkedin: item.socials?.linkedin || '',
    website: item.socials?.website || '',
    username: item.username || null,
    membership_tier: 'free',
    updated_at: new Date().toISOString(),
  });
}

function fromDbComment(row: any): Comment {
  return {
    id: String(row.id),
    articleId: row.article_id,
    userId: row.user_id,
    userName: 'WeTalks Kullanıcısı',
    userAvatar: '',
    content: row.body || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function toDbComment(item: any) {
  return cleanUndefined({
    id: isUuid(item.id) ? item.id : (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : undefined),
    article_id: item.articleId,
    user_id: isUuid(item.userId) ? item.userId : auth.currentUser?.uid,
    body: item.content || '',
    updated_at: new Date().toISOString(),
  });
}

function fromDbNotification(row: any): Notification {
  return {
    id: String(row.id),
    userId: row.user_id,
    type: row.type === 'general' ? 'newPost' : row.type,
    title: row.article_title || 'WeTalks',
    description: row.message || '',
    createdAt: row.created_at || new Date().toISOString(),
    isRead: Boolean(row.read),
    link: row.article_id ? ('/?view=article&id=' + encodeURIComponent(row.article_id)) : undefined,
  } as Notification;
}

function toDbNotification(item: any) {
  return cleanUndefined({
    id: isUuid(item.id) ? item.id : (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : undefined),
    user_id: isUuid(item.userId) ? item.userId : auth.currentUser?.uid,
    type: item.type || 'general',
    article_id: item.link?.includes('id=') ? item.link.split('id=')[1] : null,
    article_title: item.title || null,
    message: item.description || '',
    read: Boolean(item.isRead),
    created_at: item.createdAt || new Date().toISOString(),
  });
}

function fromDbSeries(row: any): ArticleSeries {
  let articleIds: string[] = [];
  if (Array.isArray(row.outline)) {
    articleIds = row.outline.flatMap((node: any) => node.article_ids || (node.article_id ? [node.article_id] : []));
  } else if (row.outline && Array.isArray(row.outline.articleIds)) {
    articleIds = row.outline.articleIds;
  }
  return {
    id: String(row.id),
    title: row.title || '',
    description: row.description || '',
    articleIds,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function toDbSeries(item: any) {
  return cleanUndefined({
    id: String(item.id),
    title: item.title || '',
    tagline: '',
    description: item.description || '',
    concept_description: null,
    topics: [],
    article_count: Array.isArray(item.articleIds) ? item.articleIds.length : 0,
    outline: { articleIds: Array.isArray(item.articleIds) ? item.articleIds : [] },
    og_image: null,
    author_id: null,
    logo_url: null,
    updated_at: new Date().toISOString(),
  });
}

function fromDbCategory(row: any): Category {
  return {
    id: String(row.id),
    name: row.name || '',
    slug: row.slug || slugify(row.name || row.id),
    description: row.description || '',
    icon: row.icon || 'BookOpen',
  };
}

function toDbCategory(item: any) {
  return cleanUndefined({
    id: String(item.id),
    name: item.name || '',
    slug: item.slug || slugify(item.name || item.id),
    description: item.description || '',
    icon: item.icon || 'BookOpen',
    updated_at: new Date().toISOString(),
  });
}

function fromDbCalendarEvent(row: any): CalendarEvent {
  return {
    id: String(row.id),
    title: row.title || '',
    description: row.description || '',
    date: row.date,
    endDate: row.end_date || undefined,
    durationDays: row.duration_days == null ? undefined : Number(row.duration_days),
    time: row.time || undefined,
    location: row.location || undefined,
    organizer: row.organizer || undefined,
    sourceUrl: row.source_url || undefined,
    isAiGenerated: Boolean(row.is_ai_generated),
  };
}

function toDbCalendarEvent(item: any) {
  return cleanUndefined({
    id: String(item.id),
    title: item.title || '',
    description: item.description || '',
    date: item.date,
    end_date: item.endDate || null,
    duration_days: item.durationDays ?? null,
    time: item.time || null,
    location: item.location || null,
    organizer: item.organizer || null,
    source_url: item.sourceUrl || null,
    is_ai_generated: Boolean(item.isAiGenerated),
    updated_at: new Date().toISOString(),
  });
}

function mergeById<T extends { id: string }>(base: T[], remote: T[]) {
  // Migration rule: wetalks_last is the canonical latest snapshot.
  // Keep DB-only records, but when IDs collide prefer the latest repository model
  // until the legacy PostgreSQL dataset is fully migrated to the new schema.
  const map = new Map<string, T>();
  for (const item of remote) map.set(String(item.id), item);
  for (const item of base) map.set(String(item.id), item);
  return Array.from(map.values());
}

async function fetchMappedCollection<T extends { id: string }>(collectionName: string): Promise<T[]> {
  let table = collectionName;
  if (!['articles','profiles','comments','notifications','series','categories','calendar_events'].includes(table)) return [];

  let path = '/' + table + '?select=*';
  if (table === 'articles') path += '&order=created_at.desc';
  if (table === 'notifications' && auth.currentUser?.uid) {
    path += '&user_id=eq.' + encodeURIComponent(auth.currentUser.uid) + '&order=created_at.desc';
  }

  const rows = await apiRequest(path);
  if (!Array.isArray(rows)) return [];

  if (table === 'articles') return rows.map(fromDbArticle) as T[];
  if (table === 'profiles') return rows.map(fromDbProfile) as T[];
  if (table === 'comments') return rows.map(fromDbComment) as T[];
  if (table === 'notifications') return rows.map(fromDbNotification) as T[];
  if (table === 'series') return rows.map(fromDbSeries) as T[];
  if (table === 'categories') return rows.map(fromDbCategory) as T[];
  if (table === 'calendar_events') return rows.map(fromDbCalendarEvent) as T[];
  return [];
}

export async function syncCollectionFromCloud<T extends { id: string }>(
  collectionName: string,
  initialData: T[],
): Promise<T[]> {
  if (collectionName === 'notifications' && !auth.currentUser) return initialData;
  try {
    const remote = await fetchMappedCollection<T>(collectionName);
    const merged = mergeById(initialData, remote);
    collectionCache.set(collectionName, merged);
    return merged;
  } catch (error) {
    console.warn('[SelfHosted] Collection read failed, using local defaults:', collectionName, error);
    collectionCache.set(collectionName, initialData);
    return initialData;
  }
}

export async function syncDocumentFromCloud<T>(
  collectionName: string,
  docId: string,
  defaultData: T,
): Promise<T> {
  if (collectionName !== 'settings') return defaultData;
  try {
    const rows = await apiRequest('/site_settings?key=eq.' + encodeURIComponent(docId) + '&select=key,value');
    if (!Array.isArray(rows) || !rows.length) return defaultData;
    const value = rows[0]?.value;
    if (typeof value !== 'string' || !value.trim()) return defaultData;
    return JSON.parse(value) as T;
  } catch {
    return defaultData;
  }
}

async function upsertRow(table: string, row: any, conflict = 'id') {
  const path = '/' + table + '?on_conflict=' + encodeURIComponent(conflict);
  return apiRequest(path, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(row),
  });
}

export async function saveDocToCloud<T>(collectionName: string, docId: string, data: T): Promise<void> {
  if (!auth.currentUser) return;
  try {
    if (collectionName === 'settings') {
      await upsertRow('site_settings', {
        key: docId,
        value: JSON.stringify(cleanUndefined(data)),
        updated_at: new Date().toISOString(),
      }, 'key');
      return;
    }

    if (collectionName === 'profiles') {
      const item: any = data;
      if (!isUuid(item.id)) return;
      await upsertRow('profiles', toDbProfile(item));
      return;
    }
    if (collectionName === 'articles') {
      await upsertRow('articles', toDbArticle(data));
      return;
    }
    if (collectionName === 'comments') {
      const row = toDbComment(data);
      if (!isUuid(row.user_id)) return;
      await upsertRow('comments', row);
      return;
    }
    if (collectionName === 'notifications') {
      const row = toDbNotification(data);
      if (!isUuid(row.user_id)) return;
      await upsertRow('notifications', row);
      return;
    }
    if (collectionName === 'series') {
      await upsertRow('series', toDbSeries(data));
      return;
    }
    if (collectionName === 'categories') {
      await upsertRow('categories', toDbCategory(data));
      return;
    }
    if (collectionName === 'calendar_events') {
      await upsertRow('calendar_events', toDbCalendarEvent(data));
    }
  } catch (error) {
    console.warn('[SelfHosted] Save skipped/failed:', collectionName, docId, error);
  }
}

export async function deleteDocFromCloud(collectionName: string, docId: string): Promise<void> {
  if (!auth.currentUser) return;
  if (!['articles','profiles','comments','notifications','series','categories','calendar_events'].includes(collectionName)) return;
  try {
    await apiRequest('/' + collectionName + '?id=eq.' + encodeURIComponent(docId), {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
  } catch (error) {
    console.warn('[SelfHosted] Delete failed:', collectionName, docId, error);
  }
}

export async function syncCollectionToCloud<T extends { id: string }>(
  collectionName: string,
  data: T[],
): Promise<void> {
  if (!auth.currentUser) return;
  for (const item of data) {
    await saveDocToCloud(collectionName, item.id, item);
  }
}

export function collection(_db: typeof db, name: string) {
  return { name };
}

export function onSnapshot(
  ref: { name: string },
  onNext: (snapshot: { empty: boolean; forEach: (cb: (doc: { data: () => unknown }) => void) => void }) => void,
  onError?: (error: unknown) => void,
) {
  let active = true;

  const poll = async () => {
    try {
      const base = (collectionCache.get(ref.name) || []) as any[];
      const data = await syncCollectionFromCloud<any>(ref.name, base);
      if (!active) return;
      onNext({
        empty: data.length === 0,
        forEach: cb => data.forEach(item => cb({ data: () => item })),
      });
    } catch (error) {
      if (active) onError?.(error);
    }
  };

  const timer = typeof window !== 'undefined' ? window.setInterval(poll, 30000) : undefined;
  return () => {
    active = false;
    if (timer !== undefined) window.clearInterval(timer);
  };
}

export async function createContactMessage(payload: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const response = await fetch('/api/contact/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || 'Mesaj gönderilemedi.');
  }
  return response.json().catch(() => ({ success: true }));
}

export async function getContactMessages() {
  if (!auth.currentUser) return [] as any[];
  try {
    const rows = await apiRequest('/contact_messages?select=*&order=created_at.desc');
    return Array.isArray(rows)
      ? rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          subject: row.subject,
          message: row.message,
          status: row.status,
          createdAt: row.created_at,
        }))
      : [];
  } catch {
    return [];
  }
}

export async function updateContactMessage(messageId: string, patch: { status?: string }) {
  if (!auth.currentUser) return;
  await apiRequest('/contact_messages?id=eq.' + encodeURIComponent(messageId), {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      ...patch,
      updated_at: new Date().toISOString(),
    }),
  });
}

export async function deleteContactMessage(messageId: string) {
  if (!auth.currentUser) return;
  await apiRequest('/contact_messages?id=eq.' + encodeURIComponent(messageId), {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });
}

export async function getSelfHostedAccessToken() {
  return getAccessToken();
}
