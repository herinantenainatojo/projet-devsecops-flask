from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash
import os
app = create_app()
def init_db():
    with app.app_context():
        try:
            db.create_all()
            print("✔️ Tables de base de données créées")
            if not User.query.filter_by(username="admin").first():
                admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
                admin = User(username="admin", password=generate_password_hash(admin_password), role="admin")
                db.session.add(admin)
                db.session.commit()
                print("✔️ Admin créé avec succès (username: admin)")
                if admin_password == "admin123":
                    print("⚠️  ATTENTION: Utilisez un mot de passe sécurisé en production!")
            else:
                print("ℹ️  Admin existe déjà")
        except Exception as e:
            print(f"❌ Erreur lors de l'initialisation de la base de données: {e}")
init_db()
if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 5001))
    print(f"🔧 Mode développement local - Port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
