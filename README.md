# 📦 Hakaton_SET_ZakupBot

> **Procurement Cost Tracker & Smart Report Generator**  
> A lightweight web application for calculating purchase costs, overheads, per-unit prices, and generating clean vector PDF reports. Built for speed, clarity, and multi-language support.

[![Status](https://img.shields.io/badge/status-MVP%20Complete-brightgreen)](https://github.com/MarikSH/Hakaton_SET_ZakupBot)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-compose-ready-blue)](https://docs.docker.com/compose/)

---

## ✨ Features

### 💰 Smart Calculator
- Budget tracking with real-time expense parsing (e.g., `"delivery 20"` → auto-categorized)
- Automatic per-unit cost & overhead calculation
- Visual expense structure with percentages + progress bars

### 📄 Professional PDF Export
- Vector-based PDF generation (~170KB file size)
- Full Cyrillic & English support (Roboto font embedded)
- Auto-switches labels based on UI language
- Clean grid layout with tables, charts, and notes section

### 🌍 Internationalization
- Full i18n support: **Russian** RU & **English** US
- Language toggle 
- All UI texts, labels, and PDF content localized

### 🎨 User Experience
- Dark / Light theme toggle with smooth transitions
- Responsive mobile-first design 
- Procurement history: view, delete, restore drafts
- Notes field per report for additional context

### 🐳 Deployment Ready
- Docker Compose setup (Frontend + Backend + PostgreSQL)
- Nginx reverse proxy configured
- Ready for cloud deployment (Railway, Render, VPS)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI, SQLAlchemy, PostgreSQL, Pydantic |
| **Frontend** | React 18, Vite, Tailwind CSS, i18next |
| **State/UX** | React Hooks, ThemeContext, localStorage |
| **PDF Engine** | jsPDF + jspdf-autotable + Roboto fonts |
| **Infra** | Docker Compose, Nginx, GitHub Actions (CI/CD ready) |

---

## 🚀 Quick Start

### 1. Clone & Run
```bash
git clone https://github.com/MarikSH/Hakaton_SET_ZakupBot.git
cd Hakaton_SET_ZakupBot
docker compose up -d
