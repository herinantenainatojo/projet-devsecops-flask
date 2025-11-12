from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from config import Config

db = SQLAlchemy()
login = LoginManager()
login.login_view = (
    "routes.login"  # ✅ nom complet du point de terminaison (via Blueprint)
)


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login.init_app(app)

    # from app import models  # <-- supprimé, inutilisé
    from app import routes

    app.register_blueprint(routes.bp)

    return app
