# 📦 Procurement Cost Tracker (Hakaton SET)
Full-stack PWA для расчёта себестоимости закупок маркетплейсов.

## 🚀 Быстрый старт
\`\`\`bash
cd Hakaton_SET_ZakupBot
docker compose up -d --build
\`\`\`
🌐 Frontend: \`http://localhost\`  
📊 API Docs: \`http://localhost:8000/docs\`

## ✅ Фичи
- Строгая формула: \`price_per_unit + (overhead / qty)\`
- NLP-парсинг расходов (доставка, упаковка, рабочие, дизайн, склад)
- Контроль бюджета + алерты перерасхода
- Статусы закупок: \`active\` → \`completed\`
- PWA + i18n (RU/EN) + Recharts
- Docker Compose (1 команда для деплоя)

## 🛠 Стек
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: React + Vite + i18next + TailwindCSS
- Deploy: Docker Compose → Railway/Vercel/Любой VPS
