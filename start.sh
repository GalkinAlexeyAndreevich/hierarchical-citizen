#!/bin/bash

echo "Запуск проекта Hierarchical Citizen..."

# Собираем и запускаем контейнеры
docker-compose up --build

echo "Проект запущен!"
echo "Фронтенд: http://localhost:5173"
echo "Бэкенд API: http://localhost:3000"
echo "MongoDB: localhost:27017"
