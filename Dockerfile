FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем все файлы проекта
COPY . .

# Устанавливаем зависимости для бэкенда
WORKDIR /app/citizen-backend
RUN npm ci --only=production

# Устанавливаем зависимости для фронтенда
WORKDIR /app/citizen-frontend
RUN npm ci

# Собираем фронтенд
RUN npm run build

# Возвращаемся в корневую директорию
WORKDIR /app

# Открываем порты
EXPOSE 3000 5173

# Запускаем оба сервиса
CMD sh -c "cd citizen-frontend && VITE_API_URL=http://localhost:3000 npm run dev -- --host 0.0.0.0 & cd citizen-backend && npm start"
