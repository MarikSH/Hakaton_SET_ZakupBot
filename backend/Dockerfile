FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install \
    --index-url=https://pypi.tuna.tsinghua.edu.cn/simple \
    --default-timeout=100 \
    --retries 5 \
    --no-cache-dir \
    -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
