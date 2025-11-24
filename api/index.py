# api/index.py

from app import create_app
from asgiref.wsgi import WsgiToAsgi

# Crée l'application Flask
flask_app = create_app()

# Convertit Flask (WSGI) en ASGI (Vercel)
app = WsgiToAsgi(flask_app)
