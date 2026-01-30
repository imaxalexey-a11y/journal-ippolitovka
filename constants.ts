
import { User, UserRole } from './types';

export const ADMIN_EMAIL = 'it_admin@ippolitovka.ru';
export const ALLOWED_DOMAIN = 'ippolitovka.ru';

export const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    email: 'it_admin@ippolitovka.ru',
    fullName: 'Системный Администратор',
    position: 'IT-Директор',
    department: 'Информационные технологии',
    role: UserRole.ADMIN
  }
];

export const APP_THEME = {
  primary: 'indigo-900',
  secondary: 'amber-600',
  accent: 'slate-800'
};
