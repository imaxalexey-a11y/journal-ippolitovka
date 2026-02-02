import { User, AppState, Student } from '../types';

// This file is now the API Client interacting with server.js

export const loadState = async (): Promise<AppState> => {
  try {
    const response = await fetch('/api/state');
    if (!response.ok) throw new Error('Failed to load state');
    return await response.json();
  } catch (error) {
    console.error(error);
    // Return empty fallback if server is down initially
    return {
      currentUser: null,
      users: [],
      students: [],
      attendance: {},
      workProgram: {}
    };
  }
};

export const saveState = async (state: AppState) => {
  try {
    // We send the whole state except currentUser (which is session based)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { currentUser, ...dataToSave } = state;
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSave)
    });
  } catch (error) {
    console.error("Failed to save state", error);
  }
};

export const sendAuthCode = async (email: string): Promise<boolean> => {
  const response = await fetch('/api/auth/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка отправки');
  }
  return true;
};

export const verifyAuthCode = async (email: string, code: string): Promise<User> => {
    const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Ошибка проверки');
    }
    
    return data.user;
}