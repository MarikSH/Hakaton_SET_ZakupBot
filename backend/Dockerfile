FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["sh", "-c", "until python -c \"import psycopg2; psycopg2.connect('host=db port=5432 user=admin password=secret dbname=procure_db')\" 2>/dev/null; do echo 'Waiting for DB...'; sleep 2; done && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
