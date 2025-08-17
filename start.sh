#!/bin/bash

echo "Starting Citizen Hierarchy Application..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

# Проверяем наличие docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
    exit 1
fi

# Запускаем приложение
echo "Запуск сервисов..."
docker-compose up -d

echo "Приложение запущено!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:3000"
echo "MongoDB: localhost:27017"
