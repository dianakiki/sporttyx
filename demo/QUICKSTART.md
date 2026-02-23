# 🚀 Быстрый старт - SporttyX Demo

## Локальный запуск (для разработки)

```bash
cd demo
npm install
npm start
```

Откройте http://localhost:3000

## Docker (рекомендуется для тестирования)

```bash
cd demo
docker-compose up -d
```

Откройте http://localhost:3000

Остановка:
```bash
docker-compose down
```

## Деплой на GitHub Pages

### 1. Настройте репозиторий

В `demo/package.json` измените:
```json
"homepage": "https://ваш-username.github.io/sporttyx"
```

В `demo/src/App.tsx` измените:
```tsx
<Router basename="/sporttyx">
```

### 2. Включите GitHub Pages

- Settings → Pages
- Source: **GitHub Actions**

### 3. Задеплойте

```bash
git add .
git commit -m "Deploy demo"
git push origin main
```

Готово! Через 2-3 минуты демо будет доступно по адресу:
`https://ваш-username.github.io/sporttyx`

## 📖 Подробная документация

См. [DEMO_DEPLOYMENT.md](../DEMO_DEPLOYMENT.md) в корне проекта.
