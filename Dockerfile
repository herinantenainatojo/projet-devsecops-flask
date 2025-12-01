FROM python:3.11-slim

WORKDIR /app

# Mettre à jour et installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copier d'abord requirements.txt pour meilleur caching
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copier tout le code
COPY . .

# Variables d'environnement
ENV FLASK_ENV=production \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

# Créer un utilisateur non-root
RUN useradd -m -u 1000 flaskuser && \
    chown -R flaskuser:flaskuser /app

# Passer à l'utilisateur non-root
USER flaskuser

# Exposer le port
EXPOSE 8080

# Commande de démarrage avec wsgi.py
CMD ["gunicorn", "--bind", "0.0.0.0:${PORT:-8080}", "--workers", "2", "--access-logfile", "-", "wsgi:app"]