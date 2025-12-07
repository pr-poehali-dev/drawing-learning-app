interface User {
  id: number;
  username: string;
  email: string;
  level: string;
  total_xp: number;
  avatar_url?: string;
  completed_lessons?: number;
  completed_exercises?: number;
}

export const AUTH_STORAGE_KEY = 'artlearn_user';

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const createUser = async (username: string, email: string): Promise<User> => {
  const response = await fetch('https://functions.poehali.dev/d0ee7fd9-50af-408b-8125-690b662822cc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email })
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }

  const user = await response.json();
  setCurrentUser(user);
  return user;
};

export const fetchUserData = async (userId: number): Promise<User> => {
  const response = await fetch(`https://functions.poehali.dev/d0ee7fd9-50af-408b-8125-690b662822cc?id=${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }

  const user = await response.json();
  setCurrentUser(user);
  return user;
};
