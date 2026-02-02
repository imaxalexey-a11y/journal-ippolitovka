# Инструкция по развертыванию приложения "Журнал посещаемости" на VPS

## Системные требования
- Ubuntu 20.04 / 22.04 или выше
- Node.js 18.x или выше
- Nginx
- PM2 (для управления процессом)
- Git

## 1. Подготовка сервера

### Обновление системы
```bash
sudo apt update
sudo apt upgrade -y
```

### Установка Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Проверка версии
npm --version
```

### Установка Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Установка PM2
```bash
sudo npm install -g pm2
```

### Установка Git
```bash
sudo apt install git -y
```

## 2. Клонирование и настройка проекта

### Клонирование репозитория
```bash
cd /var/www
sudo git clone https://github.com/imaxalexey-a11y/journal-ippolitovka.git
sudo chown -R $USER:$USER journal-ippolitovka
cd journal-ippolitovka
```

### Установка зависимостей
```bash
# Backend зависимости
npm install

# Frontend зависимости
cd client
npm install
cd ..
```

### Настройка .env файла
```bash
nano .env
```

Проверьте и при необходимости измените параметры:
```env
PORT=3001
NODE_ENV=production
JWT_SECRET=замените-на-случайную-строку-минимум-32-символа
SESSION_TIMEOUT=3600000

# SMTP Configuration
SMTP_HOST=mail.ippolitovka.ru
SMTP_PORT=587
SMTP_USER=no-reply@ippolitovka.ru
SMTP_PASS=Ipp2023!!!
SMTP_FROM=no-reply@ippolitovka.ru

# Domain restriction
ALLOWED_DOMAIN=ippolitovka.ru

# Admin email
ADMIN_EMAIL=it_admin@ippolitovka.ru

# Database
DB_PATH=./database.sqlite
```

**ВАЖНО**: Сгенерируйте новый JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Сборка React приложения
```bash
cd client
npm run build
cd ..
```

## 3. Настройка Nginx

### Копирование конфигурации
```bash
sudo cp nginx.conf /etc/nginx/sites-available/journal-ippolitovka
```

### Редактирование конфигурации
```bash
sudo nano /etc/nginx/sites-available/journal-ippolitovka
```

Замените `your-domain.com` на ваш реальный домен (например, journal.ippolitovka.ru)

### Активация сайта
```bash
sudo ln -s /etc/nginx/sites-available/journal-ippolitovka /etc/nginx/sites-enabled/
sudo nginx -t  # Проверка конфигурации
sudo systemctl reload nginx
```

## 4. Настройка SSL сертификата (Let's Encrypt)

### Установка Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Получение сертификата
```bash
sudo certbot --nginx -d your-domain.com
# Следуйте инструкциям на экране
```

### Автоматическое обновление сертификата
```bash
sudo certbot renew --dry-run  # Тест обновления
```

## 5. Запуск приложения через PM2

### Создание директории для логов
```bash
mkdir -p logs
```

### Запуск через PM2
```bash
pm2 start ecosystem.config.js
```

### Сохранение конфигурации PM2
```bash
pm2 save
pm2 startup  # Скопируйте и выполните команду, которую выведет PM2
```

### Полезные команды PM2
```bash
pm2 status                    # Статус приложения
pm2 logs journal-ippolitovka  # Просмотр логов
pm2 restart journal-ippolitovka  # Перезапуск
pm2 stop journal-ippolitovka     # Остановка
pm2 delete journal-ippolitovka   # Удаление из PM2
```

## 6. Настройка файрвола

```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
sudo ufw status
```

## 7. Обновление приложения

### Автоматический скрипт обновления
Создайте файл `update.sh`:
```bash
nano update.sh
```

Содержимое:
```bash
#!/bin/bash
git pull origin main
npm install
cd client
npm install
npm run build
cd ..
pm2 restart journal-ippolitovka
```

Сделайте скрипт исполняемым:
```bash
chmod +x update.sh
```

### Обновление приложения
```bash
./update.sh
```

## 8. Резервное копирование базы данных

### Создание скрипта резервного копирования
```bash
nano backup.sh
```

Содержимое:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/journal"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp database.sqlite $BACKUP_DIR/database_$DATE.sqlite
# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "database_*.sqlite" -mtime +30 -delete
```

Сделайте исполняемым:
```bash
chmod +x backup.sh
```

### Настройка автоматического бэкапа через cron
```bash
crontab -e
```

Добавьте строку (бэкап каждый день в 3:00):
```
0 3 * * * /var/www/journal-ippolitovka/backup.sh
```

## 9. Мониторинг и логи

### Просмотр логов приложения
```bash
pm2 logs journal-ippolitovka --lines 100
```

### Просмотр логов Nginx
```bash
sudo tail -f /var/log/nginx/journal-error.log
sudo tail -f /var/log/nginx/journal-access.log
```

### Мониторинг ресурсов
```bash
pm2 monit
```

## 10. Первый вход

1. Откройте браузер и перейдите по адресу вашего домена
2. Войдите с email: `it_admin@ippolitovka.ru`
3. Получите код на почту и введите его
4. Вы будете автоматически залогинены как администратор

## Устранение неполадок

### Проблемы с SMTP
- Проверьте настройки SMTP в `.env`
- Убедитесь, что порт 587 открыт на сервере
- Проверьте логи: `pm2 logs journal-ippolitovka`

### Проблемы с базой данных
- Проверьте права доступа к файлу `database.sqlite`
- Убедитесь, что директория доступна для записи

### Проблемы с Nginx
- Проверьте конфигурацию: `sudo nginx -t`
- Перезапустите Nginx: `sudo systemctl restart nginx`
- Проверьте логи: `sudo tail -f /var/log/nginx/error.log`

### Приложение не запускается
- Проверьте логи PM2: `pm2 logs`
- Проверьте, что все зависимости установлены: `npm install`
- Убедитесь, что порт 3001 свободен: `sudo lsof -i :3001`

## Безопасность

1. **Регулярно обновляйте систему**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Настройте автоматическое обновление SSL сертификатов**:
   ```bash
   sudo systemctl status certbot.timer
   ```

3. **Регулярно делайте резервные копии базы данных**

4. **Используйте сложный JWT_SECRET**

5. **Ограничьте доступ к серверу через SSH** (используйте SSH ключи)

6. **Регулярно проверяйте логи на подозрительную активность**

## Дополнительные настройки

### Увеличение лимита файловых дескрипторов
```bash
sudo nano /etc/security/limits.conf
```
Добавьте:
```
* soft nofile 65536
* hard nofile 65536
```

### Настройка swap (если мало RAM)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Контакты и поддержка

При возникновении проблем обращайтесь к администратору или проверьте:
- GitHub репозиторий: https://github.com/imaxalexey-a11y/journal-ippolitovka.git
- Логи приложения: `pm2 logs`
- Статус сервисов: `pm2 status` и `sudo systemctl status nginx`
