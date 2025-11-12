from flask import Flask, render_template

app = Flask(__name__)


# Route pour le tableau de bord
@app.route("/")
def index():
    return render_template("index.html")


# Route pour la page de gestion des utilisateurs
@app.route("/gestion_utilisateurs")
def gestion_utilisateurs():
    return render_template("gestion_utilisateurs.html")


# Route pour la page de gestion des documents
@app.route("/gestion_documents")
def gestion_documents():
    return render_template("gestion_documents.html")


if __name__ == "__main__":
    app.run(debug=True)
