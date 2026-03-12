FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Run migrations and start
EXPOSE 5000

CMD ["sh", "-c", "flask db upgrade && gunicorn -w 4 -b 0.0.0.0:5000 run:app"]
```

### `backend/requirements.txt` — ensure these are present:
```
flask==3.0.0
flask-sqlalchemy==3.1.1
flask-jwt-extended==4.6.0
flask-migrate==4.0.5
flask-cors==4.0.0
flask-caching==2.1.0
alembic==1.13.0
gunicorn==21.2.0
python-dotenv==1.0.0
pyotp==2.9.0
qrcode[pil]==7.4.2
requests==2.31.0