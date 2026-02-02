#!/bin/bash

# Скрипт резервного копирования базы данных журнала посещаемости

# Директория для резервных копий
BACKUP_DIR="/var/backups/journal"
# Директория проекта
PROJECT_DIR="/var/www/journal-ippolitovka"
# Имя базы данных
DB_NAME="database.sqlite"
# Дата для имени файла
DATE=$(date +%Y%m%d_%H%M%S)
# Количество дней хранения резервных копий
RETENTION_DAYS=30

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== Резервное копирование базы данных ==="
echo "Время: $(date '+%Y-%m-%d %H:%M:%S')"

# Создание директории для резервных копий
mkdir -p $BACKUP_DIR
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка: не удалось создать директорию для резервных копий${NC}"
    exit 1
fi

# Проверка существования базы данных
if [ ! -f "$PROJECT_DIR/$DB_NAME" ]; then
    echo -e "${RED}Ошибка: файл базы данных не найден${NC}"
    exit 1
fi

# Создание резервной копии
echo -e "${YELLOW}Создание резервной копии...${NC}"
cp "$PROJECT_DIR/$DB_NAME" "$BACKUP_DIR/${DB_NAME%.*}_$DATE.sqlite"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Резервная копия успешно создана: ${DB_NAME%.*}_$DATE.sqlite${NC}"
    
    # Размер резервной копии
    SIZE=$(du -h "$BACKUP_DIR/${DB_NAME%.*}_$DATE.sqlite" | cut -f1)
    echo "Размер: $SIZE"
else
    echo -e "${RED}✗ Ошибка при создании резервной копии${NC}"
    exit 1
fi

# Удаление старых резервных копий
echo -e "${YELLOW}Удаление резервных копий старше $RETENTION_DAYS дней...${NC}"
DELETED=$(find $BACKUP_DIR -name "${DB_NAME%.*}_*.sqlite" -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [ $DELETED -gt 0 ]; then
    echo -e "${GREEN}✓ Удалено старых копий: $DELETED${NC}"
else
    echo "Старых копий для удаления не найдено"
fi

# Статистика
echo ""
echo "=== Статистика ==="
TOTAL_BACKUPS=$(ls -1 $BACKUP_DIR/${DB_NAME%.*}_*.sqlite 2>/dev/null | wc -l)
echo "Всего резервных копий: $TOTAL_BACKUPS"

if [ $TOTAL_BACKUPS -gt 0 ]; then
    TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
    echo "Общий размер: $TOTAL_SIZE"
    
    echo ""
    echo "Последние 5 резервных копий:"
    ls -lht $BACKUP_DIR/${DB_NAME%.*}_*.sqlite 2>/dev/null | head -5 | awk '{print $9, "(" $5 ")"}'
fi

echo ""
echo -e "${GREEN}=== Резервное копирование завершено ===${NC}"

# Отправка уведомления (опционально)
# Раскомментируйте, если нужны email уведомления
# if [ $? -eq 0 ]; then
#     echo "Резервная копия создана успешно" | mail -s "Backup: journal-ippolitovka" admin@ippolitovka.ru
# fi
