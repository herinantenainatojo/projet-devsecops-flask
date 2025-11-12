import os
from datetime import timedelta

# Répertoire de base du projet
basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    """
    Exemple de configuration Flask.
    ⚠️ Ce fichier est un modèle — il ne contient pas de clés secrètes réelles.
    Copiez-le sous le nom `config.py` et remplissez vos propres valeurs avant exécution.
    """

    # 🔐 Clé secrète pour les sessions Flask (à remplacer par une vraie dans config.py)
    SECRET_KEY = os.environ.get("SECRET_KEY", "CHANGE_ME_SECRET_KEY")

    # 🗄️ Configuration de la base de données (SQLite par défaut)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", f"sqlite:///{os.path.join(basedir, 'projets.db')}"
    )

    # Désactiver le suivi des modifications SQLAlchemy pour de meilleures performances
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # 🔑 Configuration Flask-Login — nom du point d'entrée de la page de connexion
    LOGIN_VIEW = "routes.login"

    # ⏱️ Durée de vie de la session utilisateur (24 heures par défaut)
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)

    # 🛡️ Protection CSRF pour les formulaires Flask-WTF
    WTF_CSRF_ENABLED = True
    WTF_CSRF_SECRET_KEY = os.environ.get("CSRF_SECRET_KEY", "CHANGE_ME_CSRF_KEY")
