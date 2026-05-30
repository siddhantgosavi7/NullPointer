import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  darkMode: 'krishi.darkMode',
  offline: 'krishi.offline',
  session: 'krishi.session',
  accounts: 'krishi.accounts',
  reports: 'krishi.reports',
};

function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function makeUserProfile({ name, email, role = 'Farmer' }) {
  return {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    email,
    role,
  };
}

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => readStorage(STORAGE_KEYS.darkMode, false));
  const [offline, setOffline] = useState(() => readStorage(STORAGE_KEYS.offline, false));
  const [user, setUser] = useState(() => readStorage(STORAGE_KEYS.session, null));
  const [accounts, setAccounts] = useState(() => readStorage(STORAGE_KEYS.accounts, []));
  const [toasts, setToasts] = useState([]);
  const [savedReports, setSavedReports] = useState(() => readStorage(STORAGE_KEYS.reports, []));

  const notify = (message, type = 'success') => {
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const register = ({ name, email, password, role }) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(name || '').trim();
    const normalizedPassword = String(password || '');

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      throw new Error('Name, email, and password are required.');
    }

    if (accounts.some((account) => account.email === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const nextUser = makeUserProfile({ name: normalizedName, email: normalizedEmail, role });
    const nextAccount = { ...nextUser, password: normalizedPassword };
    setAccounts((items) => [...items, nextAccount]);
    setUser(nextUser);
    notify('Account created successfully.');
    return nextUser;
  };

  const login = ({ email, password }) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '');

    if (!normalizedEmail || !normalizedPassword) {
      throw new Error('Email and password are required.');
    }

    const account = accounts.find((item) => item.email === normalizedEmail && item.password === normalizedPassword);
    if (!account) {
      throw new Error('Incorrect email or password.');
    }

    const nextUser = { id: account.id, name: account.name, email: account.email, role: account.role };
    setUser(nextUser);
    notify('Logged in successfully.');
    return nextUser;
  };

  const logout = () => {
    setUser(null);
    notify('Logged out.');
  };

  useEffect(() => writeStorage(STORAGE_KEYS.darkMode, darkMode), [darkMode]);
  useEffect(() => writeStorage(STORAGE_KEYS.offline, offline), [offline]);
  useEffect(() => writeStorage(STORAGE_KEYS.session, user), [user]);
  useEffect(() => writeStorage(STORAGE_KEYS.accounts, accounts), [accounts]);
  useEffect(() => writeStorage(STORAGE_KEYS.reports, savedReports), [savedReports]);

  const value = useMemo(
    () => ({
      darkMode,
      offline,
      savedReports,
      toasts,
      user,
      isAuthenticated: Boolean(user),
      setDarkMode,
      setOffline,
      setSavedReports,
      notify,
      register,
      login,
      logout,
    }),
    [darkMode, offline, savedReports, toasts, user],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
