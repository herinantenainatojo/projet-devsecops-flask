# run.py - Version modifiée

from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash
import os

# Crée l'application Flask
app = create_app()

def init_db():
    """Initialise la base de données et crée un utilisateur admin par défaut"""
    with app.app_context():
        try:
            # Créer toutes les tables
            db.create_all()
            print("✅ Tables créées avec succès")
            
            # Vérifier si l'admin existe déjà
            admin_exists = User.query.filter_by(username="admin").first()
            
            if not admin_exists:
                # Récupérer le mot de passe admin depuis les variables d'environnement
                admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
                
                # Créer l'utilisateur admin
                admin_user = User(
                    username="admin",
                    password=generate_password_hash(admin_password),
                    role="admin",
                    email="admin@example.com"  # Ajoutez si votre modèle a email
                )
                
                db.session.add(admin_user)
                db.session.commit()
                print(f"✅ Utilisateur admin créé")
                
                # Avertissement sécurité
                if admin_password == "admin123":
                    print("⚠️  ATTENTION : Utilisez un mot de passe plus sécurisé!")
                    print("⚠️  Définissez la variable ADMIN_PASSWORD dans Railway")
            else:
                print("ℹ️  L'utilisateur admin existe déjà")
                
        except Exception as e:
            print(f"❌ Erreur d'initialisation : {str(e)}")
            # Ne pas lever l'exception pour ne pas bloquer le démarrage

# Exécuter l'initialisation
with app.app_context():
    init_db()

# Point d'entrée pour Gunicorn
# L'application est accessible via 'app'

# Dans run.py, modifiez la partie __main__ :
if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8080))  # 5000 → 8080
    print(f"🚀 Démarrage de Flask sur http://{host}:{port}")
    app.run(host=host, port=port)