
import { User, JournalData } from '../types';
import { INITIAL_USERS as MOCK_USERS } from '../constants';

const KEYS = {
  USERS: 'ipp_users',
  JOURNALS: 'ipp_journals',
  CURRENT_USER: 'ipp_current_user'
};

export const StorageService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : MOCK_USERS;
  },
  
  saveUsers: (users: User[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  getJournals: (): JournalData[] => {
    const data = localStorage.getItem(KEYS.JOURNALS);
    return data ? JSON.parse(data) : [];
  },

  saveJournal: (journal: JournalData) => {
    const journals = StorageService.getJournals();
    const index = journals.findIndex(j => j.id === journal.id);
    if (index > -1) {
      journals[index] = journal;
    } else {
      journals.push(journal);
    }
    localStorage.setItem(KEYS.JOURNALS, JSON.stringify(journals));
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  }
};