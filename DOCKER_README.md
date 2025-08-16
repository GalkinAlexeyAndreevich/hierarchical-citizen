# Запуск проекта в Docker

## Требования
- Docker
- Docker Compose

## Быстрый запуск

1. **Клонируйте проект**
```bash
git clone <repository-url>
cd hierarchical-citizen
```

2. **Запустите проект**

**Для Windows:**
```powershell
# PowerShell
docker-compose up --build

# Или используйте batch файл
start.bat
```

**Для Linux/Mac:**
```bash
docker-compose up --build

# Или используйте shell скрипт
chmod +x start.sh
./start.sh
```

3. **Инициализируйте данные (в новом терминале)**

**Для Windows:**
```powershell
# Если имя контейнера отличается, сначала посмотрите список:
docker ps

# Затем выполните (замените имя контейнера на ваше):
docker exec -it hierarchical-citizen-app-1 node citizen-backend/scripts/initData.js
```

**Для Linux/Mac:**
```bash
# Если имя контейнера отличается, сначала посмотрите список:
docker ps

# Затем выполните (замените имя контейнера на ваше):
docker exec -it hierarchical-citizen-app-1 node citizen-backend/scripts/initData.js
```

## Доступные сервисы

- **Фронтенд**: http://localhost:5173 (связан с бэкендом)
- **Бэкенд API**: http://localhost:3000  
- **MongoDB**: localhost:27017

## Архитектура

Проект использует единый Docker контейнер, который запускает:
- **Фронтенд (Vue.js)** на порту 5173
- **Бэкенд (Node.js + Express)** на порту 3000
- **MongoDB** для хранения данных

Фронтенд автоматически подключается к бэкенду через API и отображает данные в реальном времени.

## Структура Docker файлов

- **`Dockerfile`** - главный файл для сборки контейнера
- **`docker-compose.yml`** - конфигурация для запуска всех сервисов
- **`start.bat`** - скрипт запуска для Windows
- **`start.sh`** - скрипт запуска для Linux/Mac

## Остановка

```bash
docker-compose down
```

## Очистка

```bash
docker-compose down -v
docker system prune -f
```
