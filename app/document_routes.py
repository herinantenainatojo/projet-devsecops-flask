from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from werkzeug.utils import secure_filename
import os

document_routes = Blueprint("document_routes", __name__)

# Chemin pour stocker les fichiers uploadés
UPLOAD_FOLDER = "static/uploads/documents"
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}


# Vérifier l'extension autorisée
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# Liste des documents
@document_routes.route("/documents")
@login_required
def documents():
    files = os.listdir(UPLOAD_FOLDER)
    return render_template("documents.html", files=files)


# Ajouter un document
@document_routes.route("/add_document", methods=["GET", "POST"])
@login_required
def add_document():
    if request.method == "POST":
        if "file" not in request.files:
            flash("Aucun fichier sélectionné", "danger")
            return redirect(request.url)

        file = request.files["file"]
        if file.filename == "":
            flash("Veuillez choisir un fichier", "danger")
            return redirect(request.url)

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            flash("Document ajouté avec succès", "success")
            return redirect(url_for("document_routes.documents"))

    return render_template("add_document.html")


# Supprimer un document
@document_routes.route("/delete_document/<filename>")
@login_required
def delete_document(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        flash("Document supprimé avec succès", "success")
    else:
        flash("Fichier introuvable", "danger")
    return redirect(url_for("document_routes.documents"))
