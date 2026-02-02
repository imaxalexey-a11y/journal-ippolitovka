#!/bin/bash

echo "=== Обновление приложения Журнал посещаемости ==="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка, что скрипт запущен из правильной директории
if [ ! -f "server.js" ]; then
    echo -e "${RED}Ошибка: server.js не найден. Запустите скрипт из корневой директории проекта.${NC}"
    exit 1
fi

# Создание резервной копии базы данных
if [ -f "database.sqlite" ]; then
    echo -e "${YELLOW}Создание резервной копии базы данных...${NC}"
    BACKUP_DIR="backups"
    mkdir -p $BACKUP_DIR
    DATE=$(date +%Y%m%d_%H%M%S)
    cp database.sqlite $BACKUP_DIR/database_$DATE.sqlite
    echo -e "${GREEN}✓ Резервная копия создана: $BACKUP_DIR/database_$DATE.sqlite${NC}"
fi

# Получение последних изменений из Git
echo -e "${YELLOW}Получение последних изменений из Git...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при получении изменений из Git${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Изменения получены${NC}"

# Установка зависимостей backend
echo -e "${YELLOW}Установка зависимостей backend...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при установке зависимостей backend${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Зависимости backend установлены${NC}"

# Установка зависимостей frontend
echo -e "${YELLOW}Установка зависимостей frontend...${NC}"
cd client
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при установке зависимостей frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Зависимости frontend установлены${NC}"

# Сборка frontend
echo -e "${YELLOW}Сборка frontend приложения...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при сборке frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend собран${NC}"

cd ..

# Перезапуск приложения через PM2
echo -e "${YELLOW}Перезапуск приложения...${NC}"
pm2 restart journal-ippolitovka
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при перезапуске приложения${NC}"
    echo -e "${YELLOW}Попытка запуска приложения...${NC}"
    pm2 start ecosystem.config.js
fi
echo -e "${GREEN}✓ Приложение перезапущено${NC}"

# Проверка статуса
echo -e "${YELLOW}Проверка статуса приложения...${NC}"
sleep 2
pm2 status journal-ippolitovka

echo ""
echo -e "${GREEN}=== Обновление завершено успешно! ===${NC}"
echo ""
echo "Полезные команды:"
echo "  pm2 logs journal-ippolitovka  - просмотр логов"
echo "  pm2 status                     - статус приложений"
echo "  pm2 restart journal-ippolitovka - перезапуск"
