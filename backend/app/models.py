from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Procurement(Base):
    __tablename__ = "procurements"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    budget = Column(Float, nullable=False)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True, default="")
    products = relationship("Product", back_populates="procurement", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="procurement", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    procurement_id = Column(Integer, ForeignKey("procurements.id"), nullable=False)
    name = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    purchase_price_per_unit = Column(Float, nullable=False)
    procurement = relationship("Procurement", back_populates="products")

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    procurement_id = Column(Integer, ForeignKey("procurements.id"), nullable=False)
    category = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    procurement = relationship("Procurement", back_populates="expenses")