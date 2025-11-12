from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired


class LoginForm(FlaskForm):
    username = StringField("Nom d’utilisateur", validators=[DataRequired()])
    password = PasswordField("Mot de passe", validators=[DataRequired()])
    submit = SubmitField("Se connecter")


class PasswordResetForm(FlaskForm):
    username = StringField("Nom d’utilisateur", validators=[DataRequired()])
    new_password = PasswordField("Nouveau mot de passe", validators=[DataRequired()])
    submit = SubmitField("Réinitialiser le mot de passe")
