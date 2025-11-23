import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from datetime import timedelta

db = SQLAlchemy()
login = LoginManager()
login.login_view = "routes.login"

def create_app():
    app = Flask(__name__)
    
    # Configuration directe sans module config externe
    app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    
    # Configuration de la base de données
    database_url = os.environ.get("DATABASE_URL")
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url or "sqlite:///projets.db"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configuration Flask-Login
    app.config['LOGIN_VIEW'] = "routes.login"
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
    
    # Configuration CSRF
    app.config['WTF_CSRF_ENABLED'] = True
    app.config['WTF_CSRF_SECRET_KEY'] = os.environ.get("CSRF_SECRET_KEY", "csrf-secret-key-change-in-production")
    
    # Initialisation des extensions
    db.init_app(app)
    login.init_app(app)

    # Importer et enregistrer les routes
    from app import routes
    app.register_blueprint(routes.bp)

    return app