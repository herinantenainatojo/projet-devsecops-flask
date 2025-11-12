from app import db
from flask_login import UserMixin
from app import login


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default="utilisateur")  # admin, chef_projet, etc.


@login.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
