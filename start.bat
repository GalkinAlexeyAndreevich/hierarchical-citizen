@echo off
echo Запуск проекта Hierarchical Citizen...

REM Собираем и запускаем контейнеры
docker-compose up --build

echo Проект запущен!
echo Фронтенд: http://localhost:5173
echo Бэкенд API: http://localhost:3000
echo MongoDB: localhost:27017
pause
