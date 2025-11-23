from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash
import os

app = create_app()

def init_db():
    """Initialise la base de données et crée un utilisateur admin par défaut"""
    with app.app_context():
        try:
            # Créer toutes les tables
            db.create_all()
            print("✔️ Tables de base de données créées")
            
            # Vérifier si l'admin existe déjà
            if not User.query.filter_by(username="admin").first():
                admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
                
                admin = User(
                    username="admin",
                    password=generate_password_hash(admin_password),
                    role="admin",
                )
                db.session.add(admin)
                db.session.commit()
                print("✔️ Admin créé avec succès (username: admin)")
                
                if admin_password == "admin123":
                    print("⚠️ ATTENTION : change ADMIN_PASSWORD sur Railway !")
            else:
                print("ℹ️ Admin existe déjà")
                
        except Exception as e:
            print(f"❌ Erreur lors de l'initialisation de la base de données: {e}")

# Lancer l'initialisation
init_db()

# Railway / Gunicorn utilise "run:app"
if __name__ == "__main__":
    port = int(os.getenv("PORT",
