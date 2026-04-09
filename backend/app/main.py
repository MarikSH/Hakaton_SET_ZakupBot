from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .api.procurements import router as procurements_router  # ← Должно быть procurements

app = FastAPI(title="Procurement Cost Tracker API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(procurements_router)  # ← И здесь

Base.metadata.create_all(bind=engine)

@app.get("/health")
def health(): return {"status": "ok"}