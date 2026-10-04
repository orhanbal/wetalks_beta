import SuperTokens from 'supertokens-web-js';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword';
import Session from 'supertokens-web-js/recipe/session';

const AUTH_API_DOMAIN = 'https://auth.webrising.tr';
const DATA_BASE = AUTH_API_DOMAIN + '/data/wetalks';
const FILES_BASE = 'https://files.webrising.tr/public/wetalks';

export type LocalUser = {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
};

export type LocalSession = {
  access_token: string;
  user: LocalUser;
};

type Result<T = any> = {
  data: T | null;
  error: { message: string; code?: string } | null;
  count?: number | null;
};

let initialized = false;
let cachedUser: LocalUser | null = null;
let authListeners = new Set<(event: string, session: LocalSession | null) => void>();

function ensureAuth(): void {
  if (initialized || typeof window === 'undefined') return;
  SuperTokens.init({
    appInfo: {
      appName: 'WeTalks',
      apiDomain: AUTH_API_DOMAIN,
      apiBasePath: '/auth'
    },
    recipeList: [EmailPassword.init(), Session.init()]
  });
  initialized = true;
}

async function syncIdentity(displayName?: string): Promise<LocalUser | null> {
  ensureAuth();
  if (!(await Session.doesSessionExist())) {
    cachedUser = null;
    return null;
  }
  const response = await fetch(AUTH_API_DOMAIN + '/identity/sync/wetalks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(displayName ? { displayName } : {})
  });
  if (!response.ok) throw new Error('Kimlik eşlemesi başarısız oldu.');
  const body = await response.json();
  cachedUser = {
    id: String(body.user_id),
    email: body.email || null,
    user_metadata: displayName ? { full_name: displayName } : {},
    app_metadata: { auth_provider: 'supertokens' }
  };
  return cachedUser;
}

async function currentSession(): Promise<LocalSession | null> {
  ensureAuth();
  if (!(await Session.doesSessionExist())) return null;
  const user = cachedUser || await syncIdentity();
  if (!user) return null;
  const accessToken = (await Session.getAccessToken()) || '';
  return { access_token: accessToken, user };
}

async function emitAuth(event: string): Promise<void> {
  const session = await currentSession().catch(() => null);
  for (const cb of authListeners) {
    try { cb(event, session); } catch {}
  }
}

function err(error: unknown) {
  return { message: error instanceof Error ? error.message : String(error) };
}

function encodeFilterValue(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  return String(value);
}

class QueryBuilder<T = any> implements PromiseLike<Result<T>> {
  private method = 'GET';
  private params = new URLSearchParams();
  private body: unknown = undefined;
  private headers: Record<string,string> = {};
  private singleMode: 'none'|'single'|'maybe' = 'none';
  private head = false;
  private countRequested = false;
  private orders: string[] = [];

  constructor(private table: string) {}

  select(columns = '*', options: { count?: string; head?: boolean } = {}) {
    this.params.set('select', columns);
    this.head = Boolean(options.head);
    if (options.count) {
      this.countRequested = true;
      this.headers.Prefer = ['count=' + options.count, this.headers.Prefer].filter(Boolean).join(',');
    }
    return this;
  }

  insert(values: unknown) {
    this.method = 'POST';
    this.body = values;
    this.headers.Prefer = 'return=representation';
    return this;
  }

  update(values: unknown) {
    this.method = 'PATCH';
    this.body = values;
    this.headers.Prefer = 'return=representation';
    return this;
  }

  delete() {
    this.method = 'DELETE';
    this.headers.Prefer = 'return=representation';
    return this;
  }

  upsert(values: unknown, options: { onConflict?: string } = {}) {
    this.method = 'POST';
    this.body = values;
    if (options.onConflict) this.params.set('on_conflict', options.onConflict);
    this.headers.Prefer = 'resolution=merge-duplicates,return=representation';
    return this;
  }

  eq(column: string, value: unknown) { this.params.append(column, 'eq.' + encodeFilterValue(value)); return this; }
  neq(column: string, value: unknown) { this.params.append(column, 'neq.' + encodeFilterValue(value)); return this; }
  gt(column: string, value: unknown) { this.params.append(column, 'gt.' + encodeFilterValue(value)); return this; }
  gte(column: string, value: unknown) { this.params.append(column, 'gte.' + encodeFilterValue(value)); return this; }
  lt(column: string, value: unknown) { this.params.append(column, 'lt.' + encodeFilterValue(value)); return this; }
  lte(column: string, value: unknown) { this.params.append(column, 'lte.' + encodeFilterValue(value)); return this; }
  is(column: string, value: unknown) { this.params.append(column, 'is.' + encodeFilterValue(value)); return this; }
  not(column: string, operator: string, value: unknown) {
    this.params.append(column, 'not.' + operator + '.' + encodeFilterValue(value));
    return this;
  }

  in(column: string, values: unknown[]) {
    const encoded = values.map(v => {
      const s = encodeFilterValue(v).replace(/"/g, '\\"');
      return /[,()]/.test(s) ? '"' + s + '"' : s;
    }).join(',');
    this.params.append(column, 'in.(' + encoded + ')');
    return this;
  }

  order(column: string, options: { ascending?: boolean; nullsFirst?: boolean } = {}) {
    let v = column + '.' + (options.ascending === false ? 'desc' : 'asc');
    if (options.nullsFirst === true) v += '.nullsfirst';
    if (options.nullsFirst === false) v += '.nullslast';
    this.orders.push(v);
    return this;
  }

  limit(value: number) { this.params.set('limit', String(value)); return this; }
  range(from: number, to: number) { this.params.set('offset', String(from)); this.params.set('limit', String(Math.max(0,to-from+1))); return this; }
  single() { this.singleMode = 'single'; return this; }
  maybeSingle() { this.singleMode = 'maybe'; return this; }

  private async execute(): Promise<Result<any>> {
    try {
      if (this.orders.length) this.params.set('order', this.orders.join(','));
      const qs = this.params.toString();
      const url = DATA_BASE + '/' + encodeURIComponent(this.table) + (qs ? '?' + qs : '');
      const method = this.head ? 'HEAD' : this.method;
      const headers: Record<string,string> = { ...this.headers };
      if (this.body !== undefined) headers['Content-Type'] = 'application/json';

      const response = await fetch(url, {
        method,
        headers,
        body: this.body !== undefined && method !== 'HEAD' ? JSON.stringify(this.body) : undefined
      });

      let count: number | null = null;
      if (this.countRequested) {
        const cr = response.headers.get('content-range');
        if (cr && cr.includes('/')) {
          const n = cr.split('/').pop();
          count = n && n !== '*' ? Number(n) : null;
        }
      }

      if (!response.ok) {
        const text = await response.text();
        let message = text || ('HTTP ' + response.status);
        try { message = JSON.parse(text)?.message || JSON.parse(text)?.hint || message; } catch {}
        return { data: null, error: { message, code: String(response.status) }, count };
      }

      if (method === 'HEAD') return { data: null, error: null, count };
      const text = await response.text();
      const parsed = text ? JSON.parse(text) : null;

      if (this.singleMode !== 'none') {
        const rows = Array.isArray(parsed) ? parsed : (parsed == null ? [] : [parsed]);
        if (rows.length === 0 && this.singleMode === 'maybe') return { data: null, error: null, count };
        if (rows.length !== 1) return { data: null, error: { message: 'Expected a single row.' }, count };
        return { data: rows[0], error: null, count };
      }
      return { data: parsed, error: null, count };
    } catch (error) {
      return { data: null, error: err(error), count: null };
    }
  }

  then<TResult1 = Result<T>, TResult2 = never>(
    onfulfilled?: ((value: Result<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

function channelFactory() {
  let timer: ReturnType<typeof setInterval> | null = null;
  let callback: (() => void) | null = null;
  const channel = {
    on(_event: string, _filter: unknown, cb: () => void) { callback = cb; return channel; },
    subscribe() {
      timer = setInterval(() => { if (callback) callback(); }, 30000);
      return channel;
    },
    _close() { if (timer) clearInterval(timer); timer = null; }
  };
  return channel;
}

export const supabase = {
  from<T = any>(table: string) { return new QueryBuilder<T>(table); },

  auth: {
    async getSession() {
      try { return { data: { session: await currentSession() }, error: null }; }
      catch (e) { return { data: { session: null }, error: err(e) }; }
    },

    async getUser() {
      try {
        const session = await currentSession();
        return { data: { user: session?.user || null }, error: null };
      } catch (e) {
        return { data: { user: null }, error: err(e) };
      }
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        ensureAuth();
        const result = await EmailPassword.signIn({
          formFields: [
            { id: 'email', value: email.trim().toLowerCase() },
            { id: 'password', value: password }
          ]
        });
        if (result.status !== 'OK') {
          return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
        }
        cachedUser = null;
        const session = await currentSession();
        await emitAuth('SIGNED_IN');
        return { data: { user: session?.user || null, session }, error: null };
      } catch (e) {
        return { data: { user: null, session: null }, error: err(e) };
      }
    },

    async signUp({ email, password, options }: { email: string; password: string; options?: { data?: Record<string,unknown> } }) {
      try {
        ensureAuth();
        const result = await EmailPassword.signUp({
          formFields: [
            { id: 'email', value: email.trim().toLowerCase() },
            { id: 'password', value: password }
          ]
        });
        if (result.status !== 'OK') {
          const message = result.status === 'FIELD_ERROR'
            ? (result.formFields?.[0]?.error || 'Kayıt bilgileri geçersiz.')
            : 'User already registered';
          return { data: { user: null, session: null }, error: { message } };
        }
        cachedUser = null;
        const displayName = String(options?.data?.full_name || '').trim() || undefined;
        const user = await syncIdentity(displayName);
        const session = await currentSession();
        if (user && displayName) {
          await new QueryBuilder('profiles').update({ full_name: displayName }).eq('id', user.id);
          if (cachedUser) cachedUser.user_metadata = { full_name: displayName };
        }
        await emitAuth('SIGNED_IN');
        return { data: { user, session }, error: null };
      } catch (e) {
        return { data: { user: null, session: null }, error: err(e) };
      }
    },

    async signOut() {
      try {
        ensureAuth();
        await Session.signOut();
        cachedUser = null;
        await emitAuth('SIGNED_OUT');
        return { error: null };
      } catch (e) { return { error: err(e) }; }
    },

    async updateUser(input: { password?: string }) {
      if (!input.password) return { data: { user: cachedUser }, error: null };
      return {
        data: { user: cachedUser },
        error: { message: 'Şifre güncelleme yerel auth geçişinde geçici olarak devre dışı.' }
      };
    },

    onAuthStateChange(callback: (event: string, session: LocalSession | null) => void) {
      authListeners.add(callback);
      void currentSession().then(s => callback('INITIAL_SESSION', s)).catch(() => callback('INITIAL_SESSION', null));
      const focus = () => void currentSession().then(s => callback('TOKEN_REFRESHED', s)).catch(() => {});
      if (typeof window !== 'undefined') window.addEventListener('focus', focus);
      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
              if (typeof window !== 'undefined') window.removeEventListener('focus', focus);
            }
          }
        }
      };
    }
  },

  storage: {
    from(bucket: string) {
      return {
        async upload(path: string, file: Blob, options: { contentType?: string; upsert?: boolean } = {}) {
          try {
            const response = await fetch(
              AUTH_API_DOMAIN + '/storage/wetalks/' + encodeURIComponent(bucket) + '/' +
              path.split('/').map(encodeURIComponent).join('/'),
              {
                method: 'PUT',
                headers: { 'Content-Type': options.contentType || file.type || 'application/octet-stream' },
                body: file
              }
            );
            if (!response.ok) {
              const body = await response.json().catch(() => ({}));
              return { data: null, error: { message: body.error || 'Upload failed' } };
            }
            return { data: await response.json(), error: null };
          } catch (e) { return { data: null, error: err(e) }; }
        },
        getPublicUrl(path: string) {
          return {
            data: {
              publicUrl: FILES_BASE + '/' + encodeURIComponent(bucket) + '/' +
                path.split('/').map(encodeURIComponent).join('/')
            }
          };
        }
      };
    }
  },

  channel(_name: string) { return channelFactory(); },
  removeChannel(channel: { _close?: () => void }) { channel?._close?.(); return Promise.resolve('ok'); }
};

export type DbArticle = {
  id: string;
  title: string;
  supertitle: string | null;
  subtitle: string | null;
  category: string;
  series_id: string | null;
  series_title: string | null;
  date: string;
  excerpt: string;
  reading_time: number;
  content: string;
  published: boolean;
  featured: boolean;
  members_only: boolean;
  friend_link_token: string | null;
  boosted: boolean;
  boosted_at: string | null;
  scheduled_at: string | null;
  og_image: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SeriesOutlineNode = {
  id: string;
  title: string;
  order: number;
  article_id?: string;
  article_ids?: string[];
  children?: SeriesOutlineNode[];
};

export type DbSeries = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  concept_description: string | null;
  topics: string[] | null;
  outline: SeriesOutlineNode[] | null;
  article_count: number;
  og_image: string | null;
  logo_url: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbHeroSlide = {
  id: string;
  type: 'article' | 'series';
  item_id: string;
  sort_order: number;
  active: boolean;
  chapter_title: string | null;
  progress_bar_color: string | null;
  bottom_bar_color: string | null;
  created_at: string;
};

export type DbSiteSetting = {
  key: string;
  value: string;
  updated_at: string;
};
