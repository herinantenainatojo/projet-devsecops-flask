import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login = LoginManager()
login.login_view = "routes.login"

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    
    # Configuration base de données ADAPTATIVE
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        # En production (Railway) - PostgreSQL
        # Railway fournira DATABASE_URL automatiquement
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        print("🔗 Utilisation de PostgreSQL (Production)")
    else:
        # En développement - SQLite
        app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///projets.db"
        print("🔗 Utilisation de SQLite (Développement)")
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['WTF_CSRF_ENABLED'] = True
    app.config['WTF_CSRF_SECRET_KEY'] = os.environ.get("CSRF_SECRET_KEY", "csrf-secret-key-change-in-production")
    
    db.init_app(app)
    login.init_app(app)

    from app import routes
    app.register_blueprint(routes.bp)

    return app