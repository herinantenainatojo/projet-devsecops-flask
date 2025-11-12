from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

app = create_app()


def init_db():
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(username="admin").first():
            admin = User(
                username="admin",
                password=generate_password_hash("admin123"),
                role="admin",
            )
            db.session.add(admin)
            db.session.commit()
            print("✔️ Admin créé avec succès")


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
