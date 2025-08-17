@echo off
echo Останавливаем существующие контейнеры...
docker-compose down

echo Пересобираем и запускаем проект...
docker-compose up --build

echo Frontend: http://localhost:5173
