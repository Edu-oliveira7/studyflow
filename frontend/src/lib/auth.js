const AUTH_KEYS = {
  accessToken: "access_token",
  userId: "user_id",
  userEmail: "user_email",
  username: "username",
};

function getFromSession(key) {
  return sessionStorage.getItem(key);
}

function getFromLocal(key) {
  return localStorage.getItem(key);
}

function moveLegacyLocalToSession() {
  const token = getFromLocal(AUTH_KEYS.accessToken);
  if (!token) return;

  Object.values(AUTH_KEYS).forEach((key) => {
    const value = getFromLocal(key);
    if (value) {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  });
}

export function getAccessToken() {
  const sessionToken = getFromSession(AUTH_KEYS.accessToken);
  if (sessionToken) return sessionToken;

  moveLegacyLocalToSession();
  return getFromSession(AUTH_KEYS.accessToken);
}

export function setAuthSession({ access, user }) {
  sessionStorage.setItem(AUTH_KEYS.accessToken, access);
  sessionStorage.setItem(AUTH_KEYS.userId, String(user.id));
  sessionStorage.setItem(AUTH_KEYS.userEmail, user.email);
  sessionStorage.setItem(AUTH_KEYS.username, user.username || "");

  Object.values(AUTH_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function getUsername() {
  const username = getFromSession(AUTH_KEYS.username);
  if (username) return username;
  moveLegacyLocalToSession();
  return getFromSession(AUTH_KEYS.username);
}

export function clearAuthSession() {
  Object.values(AUTH_KEYS).forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}
