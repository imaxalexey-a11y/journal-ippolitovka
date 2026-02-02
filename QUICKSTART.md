# Быстрый старт - Журнал посещаемости

## Предварительные требования на VPS
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nginx
sudo apt install nginx -y

# PM2
sudo npm install -g pm2

# Git
sudo apt install git -y
```

## Развертывание за 5 минут

### 1. Клонирование и установка
```bash
cd /var/www
sudo git clone https://github.com/imaxalexey-a11y/journal-ippolitovka.git
sudo chown -R $USER:$USER journal-ippolitovka
cd journal-ippolitovka

# Установка всех зависимостей
npm run install-all
```

### 2. Настройка .env
```bash
nano .env
```
Обязательно замените:
- `JWT_SECRET` - на случайную строку (используйте: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Проверьте настройки SMTP

### 3. Сборка и запуск
```bash
# Сборка frontend
npm run build-client

# Запуск через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Настройка Nginx
```bash
# Скопировать конфигурацию
sudo cp nginx.conf /etc/nginx/sites-available/journal-ippolitovka

# Отредактировать (заменить your-domain.com на реальный домен)
sudo nano /etc/nginx/sites-available/journal-ippolitovka

# Активировать
sudo ln -s /etc/nginx/sites-available/journal-ippolitovka /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL сертификат
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### 6. Файрвол
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Готово! 🎉

Откройте браузер и перейдите на ваш домен.

**Первый вход:**
- Email: `it_admin@ippolitovka.ru`
- Получите код на почту
- Войдите в систему

## Полезные команды

```bash
# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs journal-ippolitovka

# Перезапуск
pm2 restart journal-ippolitovka

# Обновление приложения
./update.sh

# Резервное копирование
./backup.sh
```

## Автоматический бэкап

```bash
crontab -e
# Добавьте строку:
0 3 * * * /var/www/journal-ippolitovka/backup.sh
```

## Устранение проблем

**Проблема:** Приложение не запускается
```bash
# Проверьте логи
pm2 logs journal-ippolitovka --lines 50
# Проверьте порт
sudo lsof -i :3001
```

**Проблема:** Nginx ошибка
```bash
# Проверьте конфигурацию
sudo nginx -t
# Посмотрите логи
sudo tail -f /var/log/nginx/error.log
```

**Проблема:** Email не отправляется
```bash
# Проверьте настройки в .env
cat .env | grep SMTP
# Проверьте логи
pm2 logs journal-ippolitovka | grep -i smtp
```

## Структура проекта

```
journal-ippolitovka/
├── server.js              # Backend сервер
├── database.js            # База данных
├── email.js               # Email сервис
├── middleware.js          # Авторизация
├── .env                   # Конфигурация
├── client/                # React приложение
│   └── build/             # Собранное приложение
├── update.sh              # Скрипт обновления
├── backup.sh              # Скрипт бэкапа
├── DEPLOYMENT.md          # Полная инструкция
└── README.md              # Документация
```

## Дополнительная информация

Подробная инструкция: [DEPLOYMENT.md](DEPLOYMENT.md)
Документация: [README.md](README.md)
GitHub: https://github.com/imaxalexey-a11y/journal-ippolitovka.git
