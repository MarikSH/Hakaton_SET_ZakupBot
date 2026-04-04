
# Procurement Cost Tracker - Implementation Plan

## 🎯 MVP Scope (24 часа)
- [ ] Backend API (FastAPI)
- [ ] Database (PostgreSQL)
- [ ] Frontend PWA (React/Vue)
- [ ] Docker deploy
- [ ] Charts + per-unit calculation

## 📁 Project Structure
```
procure-app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic
│   │   ├── crud.py          # DB operations
│   │   └── api/
│   │       └── expenses.py  # /expenses endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── pages/
│   ├── public/
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

## 🛠 Backend (6 часов)
### Models
```python
class User(Base):
    id: int
    budget: float

class Expense(Base):
    id: int
    user_id: int
    category: str     # 'goods', 'delivery', 'packaging'
    qty: float = 1    # 100 для товаров
    unit_price: float
    total: float      # qty * unit_price
```

### Endpoints
```
POST /users/ - create user + set budget
POST /expenses/ - add expense (parse "100x50000")
GET /stats/{user_id} - category totals + pie data
GET /per_unit/{user_id} - cost per unit
GET /report/{user_id} - full summary
```

## 🎨 Frontend (8 часов)
- Chat-like UI (input + history расходов)
- Dashboard: budget bar, pie chart (Recharts)
- Forms: category dropdown + qty/price inputs
- PWA manifest для установки на телефон
- Responsive для мобильных

## 🗄 Database Schema
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    budget DECIMAL,
    created_at TIMESTAMP
);

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users,
    category VARCHAR(50),
    qty DECIMAL DEFAULT 1,
    unit_price DECIMAL,
    total DECIMAL,
    created_at TIMESTAMP
);
```

## 📊 Per-Unit Calculation
```python
def calculate_per_unit(expenses: List[Expense]) -> float:
    goods_qty = sum(e.qty for e in expenses if e.category == 'goods')
    total_cost = sum(e.total for e in expenses)
    return total_cost / goods_qty if goods_qty > 0 else 0
```

## 🚀 Deploy Plan
1. `docker-compose up` - local dev
2. Backend → Railway/Heroku (free tier)
3. Frontend → Vercel/Netlify (static PWA)
4. CORS setup для frontend-backend

## ⏱ Timeline (24h hackathon)
```
0-2h: DB schema + FastAPI CRUD
2-6h: Frontend dashboard + charts
6-8h: Expense forms + parsing
8-10h: Per-unit logic + reports
10-12h: PWA + responsive
12-18h: Docker + testing
18-24h: Polish + demo prep
```

## 🎨 Demo Flow
1. Add budget $10K
2. Add goods (100x$50), delivery $500, packaging $2/unit
3. Show stats pie chart
4. /per_unit = $52.50 → "Sell above $60 for profit!"

## Tech Stack Summary
- Backend: FastAPI, SQLAlchemy, Pydantic
- Frontend: React/Vue + Recharts + Tailwind
- DB: PostgreSQL
- Deploy: Docker + Railway/Vercel
- Charts: matplotlib/png или Recharts (interactive)
