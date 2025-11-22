from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash
import os

app = create_app()

def init_db():
    """Initialise la base de données et crée un utilisateur admin par défaut"""
    with app.app_context():
        # Créer toutes les tables
        db.create_all()
        print("✔️ Tables de base de données créées")
        
        # Vérifier si l'admin existe déjà
        if not User.query.filter_by(username="admin").first():
            # Mot de passe admin depuis variable d'environnement ou valeur par défaut
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
                print("⚠️  ATTENTION: Utilisez un mot de passe sécurisé en production!")
        else:
            print("ℹ️  Admin existe déjà")

if __name__ == "__main__":
    # Initialiser la base de données
    init_db()
    
    # Configuration selon l'environnement
    flask_env = os.getenv("FLASK_ENV", "development")
    
    if flask_env == "production":
        # En production : pas de debug, bind sur toutes les interfaces
        app.run(
            host="0.0.0.0",
            port=int(os.getenv("PORT", 5000)),
            debug=False
        )
    else:
        # En développement : debug activé
        app.run(
            host="0.0.0.0",
            port=int(os.getenv("PORT", 5000)),
            debug=True
        )