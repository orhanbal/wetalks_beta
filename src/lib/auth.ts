import SuperTokens from 'supertokens-web-js';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword';
import Session from 'supertokens-web-js/recipe/session';

export const AUTH_API_DOMAIN =
  (import.meta.env.VITE_AUTH_API_DOMAIN as string | undefined) ||
  'https://auth.webrising.tr';

export interface AuthUser {
  id: string;
  email: string | null;
}

let initialized = false;
let postgrestToken: { value: string; expiresAt: number } | null = null;

export function ensureAuth(): void {
  if (initialized || typeof window === 'undefined') return;

  SuperTokens.init({
    appInfo: {
      appName: 'WeTalks',
      apiDomain: AUTH_API_DOMAIN,
      apiBasePath: '/auth',
    },
    recipeList: [
      EmailPassword.init(),
      Session.init({
        tokenTransferMethod: 'header',
      }),
    ],
  });

  initialized = true;
}

ensureAuth();

export function notifyAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('webrising-auth-changed'));
  }
  postgrestToken = null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  ensureAuth();
  if (!(await Session.doesSessionExist())) return null;

  const response = await fetch(`${AUTH_API_DOMAIN}/me`);
  if (!response.ok) return null;
  const user = (await response.json()) as AuthUser;
  return {
    id: String(user.id || ''),
    email: user.email || null,
  };
}

export async function signInWithEmail(email: string, password: string) {
  ensureAuth();
  const response = await EmailPassword.signIn({
    formFields: [
      { id: 'email', value: email.trim().toLowerCase() },
      { id: 'password', value: password },
    ],
  });
  if (response.status === 'OK') notifyAuthChanged();
  return response;
}

export async function signUpWithEmail(email: string, password: string) {
  ensureAuth();
  const response = await EmailPassword.signUp({
    formFields: [
      { id: 'email', value: email.trim().toLowerCase() },
      { id: 'password', value: password },
    ],
  });
  if (response.status === 'OK') notifyAuthChanged();
  return response;
}

export async function signOutUser(): Promise<void> {
  ensureAuth();
  await Session.signOut();
  notifyAuthChanged();
}

export async function getPostgrestToken(): Promise<string | null> {
  ensureAuth();
  const now = Date.now();
  if (postgrestToken && postgrestToken.expiresAt > now + 15_000) {
    return postgrestToken.value;
  }
  if (!(await Session.doesSessionExist())) return null;

  const response = await fetch(`${AUTH_API_DOMAIN}/postgrest-token`);
  if (!response.ok) return null;
  const payload = await response.json();
  const value = String(payload?.access_token || '');
  if (!value) return null;

  postgrestToken = {
    value,
    expiresAt: now + Math.max(30, Number(payload?.expires_in || 300) - 30) * 1000,
  };
  return value;
}
