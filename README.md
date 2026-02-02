# Журнал посещаемости студентов

Веб-приложение для ведения журнала посещаемости студентов и рабочих программ по дням.

## Возможности

### Для всех пользователей:
- ✅ Авторизация через email (код на почту)
- ✅ Ведение журнала посещаемости студентов по дням месяца
- ✅ Ведение рабочих программ по дням (темы занятий, домашние задания)
- ✅ Работа с группами студентов
- ✅ Добавление и редактирование списка студентов
- ✅ Выбор месяца и года для работы с журналом
- ✅ Отметки: присутствует, отсутствует, опоздал, уважительная причина

### Для администратора:
- ✅ Управление пользователями (преподавателями)
- ✅ Просмотр и редактирование данных всех пользователей
- ✅ Добавление новых пользователей
- ✅ Изменение ФИО, должности, кафедры

## Технологии

**Backend:**
- Node.js + Express
- SQLite (better-sqlite3)
- JWT авторизация
- Nodemailer для отправки email
- bcryptjs для безопасности

**Frontend:**
- React 18
- React Router
- Axios
- CSS3

**DevOps:**
- PM2 для управления процессом
- Nginx как reverse proxy
- Let's Encrypt для SSL

## Требования

- Node.js 18.x или выше
- npm или yarn
- SMTP сервер для отправки email

## Быстрый старт (разработка)

### 1. Клонирование репозитория
```bash
git clone https://github.com/imaxalexey-a11y/journal-ippolitovka.git
cd journal-ippolitovka
```

### 2. Установка зависимостей
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Настройка окружения
Скопируйте `.env` и настройте параметры:
```bash
cp .env .env.local
nano .env.local
```

### 4. Запуск в режиме разработки

Терминал 1 (Backend):
```bash
npm run dev
```

Терминал 2 (Frontend):
```bash
cd client
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

## Развертывание на production

Подробная инструкция в файле [DEPLOYMENT.md](DEPLOYMENT.md)

Краткая версия:
```bash
# Установка зависимостей
npm install
cd client && npm install && cd ..

# Сборка frontend
cd client && npm run build && cd ..

# Запуск через PM2
pm2 start ecosystem.config.js
pm2 save
```

## Структура проекта

```
journal-ippolitovka/
├── server.js              # Главный файл сервера
├── database.js            # Работа с базой данных
├── email.js               # Отправка email
├── middleware.js          # Middleware для авторизации
├── package.json           # Зависимости backend
├── .env                   # Конфигурация (не в git)
├── ecosystem.config.js    # Конфигурация PM2
├── nginx.conf             # Конфигурация Nginx
├── DEPLOYMENT.md          # Инструкция по развертыванию
├── client/                # React приложение
│   ├── public/
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   │   ├── Login.js
│   │   │   ├── Journal.js
│   │   │   ├── Groups.js
│   │   │   └── Admin.js
│   │   ├── api.js         # API клиент
│   │   ├── App.js         # Главный компонент
│   │   ├── index.js       # Точка входа
│   │   └── index.css      # Стили
│   └── package.json       # Зависимости frontend
└── database.sqlite        # База данных (создается автоматически)
```

## API Endpoints

### Авторизация
- `POST /api/auth/send-code` - Отправка кода на email
- `POST /api/auth/verify-code` - Верификация кода и получение токена
- `GET /api/auth/me` - Информация о текущем пользователе

### Пользователи (только admin)
- `GET /api/users` - Список всех пользователей
- `POST /api/users` - Создание пользователя
- `PUT /api/users/:id` - Обновление пользователя
- `DELETE /api/users/:id` - Удаление пользователя

### Группы
- `GET /api/groups` - Список всех групп
- `POST /api/groups` - Создание группы
- `PUT /api/groups/:id` - Обновление группы
- `DELETE /api/groups/:id` - Удаление группы

### Студенты
- `GET /api/groups/:groupId/students` - Список студентов группы
- `POST /api/groups/:groupId/students` - Добавление студента
- `PUT /api/students/:id` - Обновление студента
- `DELETE /api/students/:id` - Удаление студента

### Журналы
- `GET /api/journals` - Журналы пользователя
- `POST /api/journals` - Получение/создание журнала
- `POST /api/attendance` - Обновление посещаемости
- `POST /api/programs` - Обновление рабочей программы

## Безопасность

- ✅ Доступ только для email с доменом @ippolitovka.ru
- ✅ Авторизация через одноразовые коды (срок действия 10 минут)
- ✅ JWT токены для сессий
- ✅ Rate limiting для защиты от брутфорса
- ✅ Helmet.js для безопасности заголовков
- ✅ HTTPS (в production)
- ✅ Валидация всех входных данных

## Пользователи по умолчанию

**Администратор:**
- Email: `it_admin@ippolitovka.ru`
- Права: полный доступ к системе

## Известные ограничения

- Одновременное редактирование журнала несколькими пользователями не синхронизируется в реальном времени
- Максимальное количество дней в месяце: 31
- База данных SQLite (для больших нагрузок рекомендуется PostgreSQL)

## Разработка

### Добавление новых функций

1. Создайте новую ветку:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Внесите изменения и протестируйте

3. Отправьте pull request

### Тестирование

```bash
# Backend тесты (если добавлены)
npm test

# Frontend тесты
cd client
npm test
```

## Резервное копирование

Регулярно создавайте резервные копии базы данных:
```bash
cp database.sqlite database_backup_$(date +%Y%m%d).sqlite
```

Автоматизация через cron описана в [DEPLOYMENT.md](DEPLOYMENT.md)

## Обновление

```bash
git pull origin main
npm install
cd client && npm install && npm run build && cd ..
pm2 restart journal-ippolitovka
```

## Поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs journal-ippolitovka`
2. Проверьте конфигурацию в `.env`
3. Проверьте статус сервисов: `pm2 status`
4. Создайте issue в GitHub репозитории

## Лицензия

Частный проект для ippolitovka.ru

## Авторы

- Разработка: IT отдел Ipppolitovka
- GitHub: https://github.com/imaxalexey-a11y/journal-ippolitovka.git
