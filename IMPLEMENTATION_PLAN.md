# 🚀 Hakaton_SET_ZakupBot — Implementation Plan

> **Procurement Cost Tracker & Smart Report Generator**  
> MVP Complete • Vector PDF Export • i18n (RU/EN) • Docker Ready

---

## 📊 Current Status
- ✅ **MVP Completed**: Core calculator, history, vector PDF export, i18n, dark mode
- 🛠 **Backend**: FastAPI + PostgreSQL (Dockerized)
- 🎨 **Frontend**: React 18 + Vite + Tailwind CSS + i18next
- 📦 **Deploy**: Docker Compose (Ready for VPS/Cloud)
- 📄 **PDF Engine**: jsPDF + autoTable + Roboto fonts (~170KB, Cyrillic-safe)

---

## ✅ Completed Features

### 💰 Core Calculator
- [x] Budget tracking with real-time expense parsing (`"delivery 2000"` → auto-categorized)
- [x] Per-unit cost & overhead calculation formula: `(purchase + overhead) / quantity`
- [x] Smart expense categorizer (RU/EN synonyms: "доставка"/"delivery", "упаковка"/"packaging")
- [x] Visual expense structure: list + progress bars + percentages + category colors

### 📄 Vector PDF Export
- [x] Dynamic font loading: `Roboto-Regular.ttf` + `Roboto-Bold.ttf` (Cyrillic support)
- [x] Auto-switch labels based on UI language (`isRussian ? 'Бюджет:' : 'Budget:'`)
- [x] Clean grid layout: 6-column table, budget block, expense structure, notes
- [x] Optimized file size: ~170–190 KB (vector text, not raster images)
- [x] Safe filename handling: preserves Cyrillic, removes FS-special chars

### 🌍 Internationalization & UX
- [x] Full i18n: Russian 🇷🇺 & English 🇬🇧 (i18next + locale JSON files)
- [x] Dark / Light theme toggle with smooth CSS transitions
- [x] Procurement history: view, delete, restore drafts
- [x] Notes field per report (stored in DB, exported to PDF)
- [x] Responsive mobile-first UI (Tailwind CSS)

### 🐳 Infrastructure
- [x] Docker Compose: frontend + backend + postgres + nginx
- [x] Environment variables support (`.env` for DB credentials)
- [x] CORS configured for local/cloud deployment
- [x] GitHub-ready: `.gitignore`, clean commit history, professional README

---

## 📋 Future Roadmap
*Only confirmed features — no speculative items*

- [ ] ✏️ **Inline editing of procurement names**  
  *Add pencil icon → modal/input → update DB → refresh UI*
- [ ] 🔄 **Currency converter (optional)**  
  *Real-time RUB/USD/CNY rates for international sourcing*
- [ ] 📲 **Native mobile wrapper (future)**  
  *iOS/Android app via Capacitor/React Native*
- [ ] 📱 **Full PWA support**  
  *Install prompt, service worker, offline caching*

*(Other ideas like CSV export, PWA, analytics are on hold until explicitly requested)*

---

## 📁 Project Structure
```
Hakaton_SET_ZakupBot/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI entry + CORS
│   │   ├── database.py          # PostgreSQL connection (SQLAlchemy)
│   │   ├── models.py            # User, Procurement, Product, Expense models
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── parser.py            # Smart expense categorizer (RU/EN)
│   │   └── api/
│   │       └── purchases.py     # CRUD + calculation endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   └── manifest.json        # PWA-ready (future)
│   ├── src/
│   │   ├── i18n/
│   │   │   ├── index.js         # i18next config
│   │   │   └── locales/
│   │   │       ├── ru.json      # Russian translations
│   │   │       └── en.json      # English translations
│   │   ├── api.js               # Fetch/axios wrapper for backend calls
│   │   ├── App.jsx              # Root component + routing
│   │   ├── ThemeContext.jsx     # Dark/light theme state manager
│   │   └── components/
│   │       ├── Home.jsx         # Landing: procurement name input
│   │       ├── Calculator.jsx   # Main logic + PDF generator (jsPDF)
│   │       ├── HistoryScreen.jsx # Procurement list + view/delete
│   │       └── SettingsModal.jsx # Language & theme toggle
│   ├── vite.config.js           # Vite + React plugin config
│   ├── index.html
│   ├── package.json
│   ├── nginx.conf               # Reverse proxy for frontend/backend
│   └── Dockerfile
├── docker-compose.yml           # Services: frontend, backend, postgres, nginx
├── IMPLEMENTATION_PLAN.md       # This file
└── README.md                    # Public-facing project documentation
```

---

## 🛠 Core Logic Highlights

### Per-Unit Cost Calculation (Frontend)
```javascript

const overheadPerUnit = totalExpenses / totalQuantity;
const costPerUnit = purchasePricePerUnit + overheadPerUnit;

```
###Vector PDF Generation (jsPDF + autoTable)
```javascript

// 1. Load Roboto fonts dynamically
const fontRes = await fetch('https://fonts.gstatic.com/s/roboto/.../Roboto-Regular.ttf');
doc.addFileToVFS('Roboto-Regular.ttf', arrayBufferToBase64(await fontRes.arrayBuffer()));
doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

// 2. Auto-switch labels based on language
const budgetLabel = isRussian ? 'Бюджет:' : 'Budget:';
doc.text(`${budgetLabel} ${report.budget.toFixed(2)} RUB`, x, y);

// 3. Clean table with 6 columns
autoTable(doc, {
  head: [['Товар', 'Кол-во', 'Закупка', 'Сумма', 'Накладные', 'Себестоимость']],
  body: rows,
  styles: { font: 'Roboto', fontSize: 9 } // Critical for Cyrillic
});

```

###Smart Expense Parser (Backend)
```python

# parser.py
SYNONYMS = {
    'delivery': ['доставка', 'logistics', 'shipping'],
    'packaging': ['упаковка', 'packaging', 'box'],
    # ... more RU/EN synonyms
}

def categorize_expense(text: str) -> str:
    text_lower = text.lower()
    for category, synonyms in SYNONYMS.items():
        if any(syn in text_lower for syn in synonyms):
            return category
    return 'other'

```
##🚀 Deployment Guide
###Local Development
```bash
# 1. Clone & start
git clone https://github.com/MarikSH/Hakaton_SET_ZakupBot.git
cd Hakaton_SET_ZakupBot
docker compose up -d

# 2. Access
Frontend: http://localhost
Backend API: http://localhost/api/docs (Swagger UI)
Database: PostgreSQL on port 5432
```
###Production (VPS / Cloud)
```bash
# 1. Set environment variables
echo "POSTGRES_USER=procurement" >> .env
echo "POSTGRES_PASSWORD=secure_pass" >> .env
echo "POSTGRES_DB=zakupbot_db" >> .env

# 2. Deploy
docker compose up -d --build
```

##🎨 Demo Flow (For Presentation)
1. Start: Enter procurement name "test" → Click "Continue"
2. Budget: Set 150000 RUB
3. Products:
    headphones 50 970 → 50 units × 970 RUB
    camera 60 1100 → 60 units × 1100 RUB
4. Expenses:
    delivery 3000 → auto-categorized
    workers 5000, design 1000
5. Calculate: Click 📊 Final Calculation → View table, charts, notes
6. Export: Click 📄 Download PDF → Download test_2026-04-09.pdf (~180 KB)
7. History: Save to history → View later → Delete if needed

