# backend/app/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

# 🔹 Товар внутри закупки
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(..., gt=0)
    purchase_price_per_unit: float = Field(..., gt=0)

class ProductReport(BaseModel):
    name: str
    quantity: int
    purchase_price_per_unit: float
    total_purchase_cost: float
    overhead_per_unit: float
    total_cost_per_unit: float
    
    class Config:
        from_attributes = True

# 🔹 Расходы
class ExpenseCreate(BaseModel):
    category: str = Field(..., min_length=1, max_length=50)
    amount: float = Field(..., gt=0)

# 🔹 Закупка (создание)
class ProcurementCreate(BaseModel):
    name: str = Field(default="Без названия", min_length=1, max_length=100)
    budget: float = Field(default=0, ge=0)  # ge=0 позволяет 0
    products: List[ProductCreate] = Field(default_factory=list)
    expenses_text: Optional[str] = Field(default="")
    notes: str = ""
    
    class Config:
        extra = "ignore"

# 🔹 Отчёт по закупке
class ProcurementReport(BaseModel):
    id: int
    name: str
    budget: float
    status: str
    products: List[ProductReport]
    expenses_breakdown: Dict[str, float]
    total_other_expenses: float
    total_spent: float
    budget_remaining: float
    is_over_budget: bool
    created_at: datetime
    notes: str = ""
    
    class Config:
        from_attributes = True

# 🔹 Элемент истории
class HistoryItem(BaseModel):
    id: int
    name: str
    budget: float
    completed_at: Optional[datetime]
    total_spent: float
    
    class Config:
        from_attributes = True