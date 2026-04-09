from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Procurement, Product, Expense
from ..schemas import ProcurementCreate, ProcurementReport, ProductReport
import re
from datetime import datetime

router = APIRouter(prefix="/api/v1", tags=["procurements"])

# 🔹 Локальный NLP-парсер (РАСШИРЕННЫЙ СЛОВАРЬ)
def parse_expenses_text_local(text: str) -> dict[str, float]:
    if not text or not text.strip(): 
        return {}
    
    categories = {
        "delivery": [
            "доставка", "курьер", "транспорт", "сдэк", "cdek", "почта", "логистика", 
            "пересылка", "фрахт", "груз", "перевозка", "taxi", "uber", "яндекс", 
            "доставка сдэк", "почта россии", "транспортные расходы", "логист", 
            "delivery", "shipping", "logistics", "courier", "freight", "forwarding", 
            "dispatch", "hauling", "carriage", "transit", "postage", "last-mile"
        ],
        "packaging": [
            "упаковка", "коробка", "пакет", "скотч", "бирка", "этикетка", 
            "пупырка", "тара", "пленка", "стрейч", "короб", "контейнер", 
            "наполнитель", "картон", "маркировка", "упаковочные", "коробки", 
            "box", "tape", "label", "package", "packaging", "shrink", "void fill", 
            "mailers", "sealing", "bubble wrap", "stretch wrap", "carton"
        ],
        "workers": [
            "рабочий", "зарплата", "оплата", "сборка", "фасовка", "труд", 
            "упаковщик", "бригада", "мастер", "сотрудник", "персонал", 
            "аутсорс", "клининг", "уборка", "зарплату", "работникам", "наем", 
            "workers", "salary", "wages", "labor", "assemblers", "packers", 
            "sorters", "loaders", "staff", "employees", "payroll", "crew", 
            "temp", "contractors", "helpers", "team", "manpower", "workforce"
        ],
        "design": [
            "дизайн", "логотип", "графика", "верстка", "макет", "фото", 
            "съемка", "визуал", "инфографика", "фотограф", "студия", 
            "ретушь", "иллюстрация", "брендбук", "дизайнеру", "контент", 
            "design", "photo", "photoshoot", "visual", "infographic", "logo", 
            "branding", "layout", "mockup", "retouching", "artwork", "render", 
            "creative", "banner", "poster", "catalog"
        ],
        "warehouse": [
            "хранение", "склад", "аренда", "складирование", "фулфилмент", 
            "обработка заказов", "комплектация", "отгрузка", "логистический центр", 
            "складские услуги", "ответственное хранение", "аренда помещения", 
            "warehouse", "storage", "fulfillment", "order processing", "picking", 
            "contract storage", "facility rent", "cross-docking", "inventory", 
            "hub services", "depot", "staging", "receiving", "dispatch area"
        ],
        "other": [
            "прочее", "разное", "непредвиденные", "чай", "кофе", "канцелярия", 
            "связь", "интернет", "налоги", "комиссия", "эквайринг", 
            "маркетинг", "реклама", "банковские услуги", "офис", "расходники", 
            "other", "misc", "unexpected", "tea", "coffee", "stationery", 
            "telecom", "taxes", "acquiring", "marketing", "advertising", 
            "banking", "fees", "service charge", "software", "hosting"
        ]
    }
    
    result = {"delivery": 0.0, "packaging": 0.0, "workers": 0.0, "design": 0.0, "warehouse": 0.0, "other": 0.0}
    
    for line in text.splitlines():
        match = re.search(r"(\d+(?:[.,]\d+)?)", line.lower())
        if not match: continue
        amount = float(match.group(1).replace(",", "."))
        if amount <= 0: continue
        
        categorized = False
        for cat, keywords in categories.items():
            if any(kw in line.lower() for kw in keywords):
                result[cat] += amount
                categorized = True
                break
        if not categorized: result["other"] += amount
        
    return {k: v for k, v in result.items() if v > 0}

@router.post("/procurements/")
def create_procurement(data: ProcurementCreate, db: Session = Depends(get_db)):
    try:
        proc = Procurement(name=data.name, budget=data.budget, notes=data.notes)
        db.add(proc); db.flush()
        
        for prod in data.products:
            db.add(Product(
                procurement_id=proc.id, 
                name=prod.name, 
                quantity=prod.quantity, 
                purchase_price_per_unit=prod.purchase_price_per_unit
            ))
            
        parsed = parse_expenses_text_local(data.expenses_text)
        for cat, amt in parsed.items():
            db.add(Expense(procurement_id=proc.id, category=cat, amount=amt))
            
        db.commit(); db.refresh(proc)
        return {"id": proc.id, "status": "created"}
    except Exception as e:
        db.rollback()
        raise HTTPException(400, f"Ошибка сохранения: {str(e)}")

@router.get("/procurements/{proc_id}/report", response_model=ProcurementReport)
def get_procurement_report(proc_id: int, db: Session = Depends(get_db)):
    proc = db.query(Procurement).filter(Procurement.id == proc_id).first()
    if not proc: raise HTTPException(404, "Закупка не найдена")
    
    products = db.query(Product).filter(Product.procurement_id == proc_id).all()
    expenses = db.query(Expense).filter(Expense.procurement_id == proc_id).all()
    
    total_quantity = sum(p.quantity for p in products) if products else 0
    if total_quantity == 0:
        raise HTTPException(400, "Общее количество товаров равно 0")
        
    other_total = sum(e.amount for e in expenses) if expenses else 0
    overhead_per_unit = other_total / total_quantity
    
    product_reports = []
    for p in products:
        product_reports.append(ProductReport(
            name=p.name,
            quantity=p.quantity,
            purchase_price_per_unit=p.purchase_price_per_unit,
            total_purchase_cost=p.purchase_price_per_unit * p.quantity,
            overhead_per_unit=overhead_per_unit,
            total_cost_per_unit=p.purchase_price_per_unit + overhead_per_unit
        ))
        
    total_purchase = sum(pr.total_purchase_cost for pr in product_reports)
    total_spent = total_purchase + other_total
    remaining = proc.budget - total_spent
    
    expenses_breakdown = {e.category: e.amount for e in expenses}
    
    return ProcurementReport(
        id=proc.id, name=proc.name, budget=proc.budget, status=proc.status,
        products=product_reports,
        expenses_breakdown=expenses_breakdown,
        total_other_expenses=other_total,
        total_spent=total_spent,
        budget_remaining=remaining,
        is_over_budget=remaining < 0,
        created_at=proc.created_at,
        notes=proc.notes or ""
    )

@router.put("/procurements/{proc_id}/complete")
def complete_procurement(proc_id: int, db: Session = Depends(get_db)):
    proc = db.query(Procurement).filter(Procurement.id == proc_id).first()
    if not proc: raise HTTPException(404, "Не найдено")
    proc.status = "completed"
    proc.completed_at = datetime.utcnow()
    db.commit()
    return {"status": "completed", "id": proc.id}

@router.get("/procurements/history")
def get_history(db: Session = Depends(get_db)):
    procs = db.query(Procurement).filter(Procurement.status == "completed").order_by(Procurement.completed_at.desc()).all()
    return [{
        "id": p.id, "name": p.name, "budget": p.budget, 
        "completed_at": p.completed_at.isoformat() if p.completed_at else None,
        "total_spent": sum(e.amount for e in p.expenses) + sum(pr.purchase_price_per_unit * pr.quantity for pr in p.products)
    } for p in procs]

@router.delete("/procurements/{proc_id}")
def delete_procurement(proc_id: int, db: Session = Depends(get_db)):
    proc = db.query(Procurement).filter(Procurement.id == proc_id).first()
    if not proc: raise HTTPException(404, "Закупка не найдена")
    
    # Удаляем связанные товары и расходы
    db.query(Product).filter(Product.procurement_id == proc_id).delete()
    db.query(Expense).filter(Expense.procurement_id == proc_id).delete()
    db.query(Procurement).filter(Procurement.id == proc_id).delete()
    
    db.commit()
    return {"status": "deleted"}