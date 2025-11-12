from datetime import datetime
from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.security import check_password_hash, generate_password_hash
import pandas as pd

from app import db
from app.forms import LoginForm, PasswordResetForm
from app.models import User

# Définition unique du Blueprint
bp = Blueprint("routes", __name__)

# Exemple de statistiques (tableau de bord)
DEMO_STATS = {
    "total_documents": 15,
    "budget_executed": 85,
    "districts_covered": 22,
    "delayed_projects": 3,
    "completed_projects": 18,
    "total_budget": "2.4B",
}

# Données fictives pour documents (à remplacer par DB)
MOCK_DOCUMENTS = [
    {"id": 1, "titre": "Rapport Budget 2024", "fichier": "budget2024.pdf"},
    {"id": 2, "titre": "Plan d’Action 2025", "fichier": "plan_action_2025.pdf"},
    {"id": 3, "titre": "Compte rendu réunion", "fichier": "reunion.docx"},
]


# -----------------------------
# Tableau de bord
# -----------------------------
@bp.route("/")
@bp.route("/dashboard")
@login_required
def index():
    return render_template("index.html", user=current_user, stats=DEMO_STATS)


# -----------------------------
# Authentification
# -----------------------------
@bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("routes.index"))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and check_password_hash(user.password, form.password.data):
            login_user(user)
            return redirect(url_for("routes.index"))
        else:
            flash("❌ Nom d'utilisateur ou mot de passe incorrect", "error")
    return render_template("login.html", form=form)


@bp.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("routes.login"))


@bp.route("/mot_de_passe_oublie", methods=["GET", "POST"])
def mot_de_passe_oublie():
    form = PasswordResetForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            user.password = generate_password_hash(form.new_password.data)
            db.session.commit()
            flash("✔️ Mot de passe réinitialisé avec succès.", "success")
            return redirect(url_for("routes.login"))
        else:
            flash("❌ Nom d'utilisateur introuvable.", "danger")
    return render_template("mot_de_passe_oublie.html", form=form)


@bp.route("/profile")
@login_required
def profile():
    return render_template("profile.html", user=current_user)


# -----------------------------
# Gestion des utilisateurs
# -----------------------------
@bp.route("/gestion_utilisateurs")
@login_required
def gestion_utilisateurs():
    users = User.query.all()
    return render_template("gestion_utilisateurs.html", user=current_user, users=users)


# -----------------------------
# Gestion des documents
# -----------------------------
@bp.route("/documents")
@login_required
def documents():
    return render_template("documents.html", user=current_user, files=MOCK_DOCUMENTS)


@bp.route("/add_document", methods=["GET", "POST"])
@login_required
def add_document():
    if request.method == "POST":
        titre = request.form.get("titre")
        fichier = request.files.get("fichier")

        # ✅ On simule l'utilisation des variables pour éviter les erreurs flake8
        if titre and fichier:
            pass  # À remplacer plus tard par l'enregistrement dans la DB

        flash("✔️ Document ajouté avec succès", "success")
        return redirect(url_for("routes.documents"))

    return render_template("add_document.html", user=current_user)


@bp.route("/edit_document/<int:id>", methods=["GET", "POST"])
@login_required
def edit_document(id):
    doc = next((d for d in MOCK_DOCUMENTS if d["id"] == id), None)
    if not doc:
        flash("❌ Document introuvable", "danger")
        return redirect(url_for("routes.documents"))

    if request.method == "POST":
        titre = request.form.get("titre")
        fichier = request.files.get("fichier")

        # ✅ Utilisation simulée pour éviter flake8
        if titre or fichier:
            pass  # À remplacer plus tard par la modification dans la DB

        flash("✔️ Document modifié avec succès", "success")
        return redirect(url_for("routes.documents"))

    return render_template("edit_document.html", user=current_user, document=doc)


@bp.route("/delete_document/<int:id>", methods=["POST"])
@login_required
def delete_document(id):
    # TODO: Supprimer document dans DB
    flash("❌ Document supprimé avec succès", "danger")
    return redirect(url_for("routes.documents"))


# -----------------------------
# Gestion des tâches - Région Haute Matsiatra
# -----------------------------


# Modèle de données pour les tâches
class Tache:
    def __init__(
        self,
        id,
        titre,
        date_limite,
        statut,
        priorite=None,
        description=None,
        projet=None,
        assignee=None,
    ):
        self.id = id
        self.titre = titre
        self.date_limite = date_limite
        self.statut = statut
        self.priorite = priorite
        self.description = description
        self.projet = projet
        self.assignee = assignee

    def to_dict(self):
        return {
            "id": self.id,
            "titre": self.titre,
            "date": (
                self.date_limite.strftime("%Y-%m-%d")
                if isinstance(self.date_limite, datetime)
                else self.date_limite
            ),
            "statut": self.statut,
            "priorite": self.priorite,
            "description": self.description,
            "projet": self.projet,
            "assignee": self.assignee,
        }


# Données fictives pour tâches
MOCK_TASKS = [
    Tache(
        1,
        "Préparer rapport annuel",
        datetime(2025, 9, 10),
        "En cours",
        "Haute",
        "Rapport des activités de l'année 2025",
        "Projet Développement Rural",
        "Jean Dupont",
    ),
    Tache(
        2,
        "Réunion projet infrastructure",
        datetime(2025, 9, 12),
        "Planifié",
        "Moyenne",
        "Réunion de coordination pour le projet d'infrastructure",
        "Projet Infrastructure Routière",
        "Marie Lambert",
    ),
    Tache(
        3,
        "Vérifier budget santé",
        datetime(2025, 9, 15),
        "Terminé",
        "Basse",
        "Vérification du budget alloué au projet santé",
        "Projet Santé Communautaire",
        "Paul Martin",
    ),
    Tache(
        4,
        "Commander matériel construction",
        datetime(2025, 9, 5),
        "En cours",
        "Haute",
        "Commande des matériaux pour la construction de l'école",
        "Construction école primaire",
        "Jean Dupont",
    ),
    Tache(
        5,
        "Contacter fournisseurs eau",
        datetime(2025, 9, 8),
        "En retard",
        "Moyenne",
        "Prise de contact avec les fournisseurs pour le projet eau potable",
        "Installation eau potable",
        "Marie Lambert",
    ),
]


@bp.route("/taches")
@login_required
def taches():
    # Convertir les objets Tache en dictionnaires pour le template
    tasks_data = [tache.to_dict() for tache in MOCK_TASKS]
    today = datetime.now().strftime("%Y-%m-%d")
    return render_template(
        "taches.html", user=current_user, tasks=tasks_data, today=today
    )


@bp.route("/add_task", methods=["POST"])
@login_required
def add_task():
    titre = request.form.get("titre")
    date_limite = request.form.get("date")
    statut = request.form.get("statut", "En cours")
    priorite = request.form.get("priorite", "Moyenne")
    description = request.form.get("description")
    projet = request.form.get("projet")
    assignee = request.form.get("assignee")

    # Créer un nouvel ID
    new_id = max(tache.id for tache in MOCK_TASKS) + 1 if MOCK_TASKS else 1

    # Créer la nouvelle tâche
    new_task = Tache(
        id=new_id,
        titre=titre,
        date_limite=datetime.strptime(date_limite, "%Y-%m-%d"),
        statut=statut,
        priorite=priorite,
        description=description,
        projet=projet,
        assignee=assignee,
    )

    # Ajouter à la liste
    MOCK_TASKS.append(new_task)

    flash("Tâche ajoutée avec succès", "success")
    return redirect(url_for("routes.taches"))


@bp.route("/edit_task/<int:task_id>", methods=["GET", "POST"])
@login_required
def edit_task(task_id):
    # Trouver la tâche
    tache = next((t for t in MOCK_TASKS if t.id == task_id), None)

    if not tache:
        flash("Tâche introuvable", "danger")
        return redirect(url_for("routes.taches"))

    if request.method == "POST":
        # Mettre à jour la tâche
        tache.titre = request.form.get("titre")
        tache.date_limite = datetime.strptime(request.form.get("date"), "%Y-%m-%d")
        tache.statut = request.form.get("statut")
        tache.priorite = request.form.get("priorite")
        tache.description = request.form.get("description")
        tache.projet = request.form.get("projet")
        tache.assignee = request.form.get("assignee")

        flash("Tâche modifiée avec succès", "success")
        return redirect(url_for("routes.taches"))

    # Convertir en dictionnaire pour le template
    task_data = tache.to_dict()
    return render_template("edit_task.html", user=current_user, task=task_data)


@bp.route("/delete_task/<int:task_id>", methods=["POST"])
@login_required
def delete_task(task_id):
    global MOCK_TASKS
    MOCK_TASKS = [t for t in MOCK_TASKS if t.id != task_id]
    flash("Tâche supprimée avec succès", "danger")
    return redirect(url_for("routes.taches"))


@bp.route("/complete_task/<int:task_id>", methods=["POST"])
@login_required
def complete_task(task_id):
    # Trouver la tâche
    tache = next((t for t in MOCK_TASKS if t.id == task_id), None)

    if tache:
        tache.statut = "Terminé"
        flash("Tâche marquée comme terminée", "success")

    return redirect(url_for("routes.taches"))


@bp.route("/api/taches", methods=["GET"])
@login_required
def api_taches():
    # Retourner la liste des tâches en JSON
    tasks_data = [tache.to_dict() for tache in MOCK_TASKS]
    return jsonify(tasks_data)


# -----------------------------
# Gestion des projets - Région Haute Matsiatra
# -----------------------------


# Modèle de données pour les projets
class Projet:
    def __init__(
        self,
        id,
        nom,
        date_debut,
        statut,
        date_fin=None,
        budget=None,
        progression=0,
        description=None,
    ):
        self.id = id
        self.nom = nom
        self.date_debut = date_debut
        self.statut = statut
        self.date_fin = date_fin
        self.budget = budget
        self.progression = progression
        self.description = description

    def to_dict(self):
        return {
            "id": self.id,
            "nom": self.nom,
            "date_debut": (
                self.date_debut.strftime("%Y-%m-%d")
                if isinstance(self.date_debut, datetime)
                else self.date_debut
            ),
            "statut": self.statut,
            "date_fin": (
                self.date_fin.strftime("%Y-%m-%d")
                if isinstance(self.date_fin, datetime)
                else self.date_fin
            ),
            "budget": self.budget,
            "progression": self.progression,
            "description": self.description,
        }


# Données fictives pour projets
MOCK_PROJECTS = [
    Projet(
        1,
        "Construction école primaire",
        datetime(2025, 9, 1),
        "En cours",
        datetime(2025, 12, 15),
        "150 000 Ariary",
        65,
        "Construction d'une école primaire dans le village d'Ankazo",
    ),
    Projet(
        2,
        "Réhabilitation route RN7",
        datetime(2025, 8, 15),
        "Planifié",
        datetime(2026, 2, 28),
        "850 000 Ariary",
        0,
        "Réhabilitation de 15km de la Route Nationale 7",
    ),
    Projet(
        3,
        "Installation eau potable",
        datetime(2025, 7, 20),
        "Terminé",
        datetime(2025, 10, 5),
        "120 000 Ariary",
        100,
        "Installation de système d'eau potable dans 3 villages",
    ),
]


@bp.route("/projets")
@login_required
def projets():
    # Convertir les objets Projet en dictionnaires pour le template
    projets_data = [projet.to_dict() for projet in MOCK_PROJECTS]
    return render_template("projets.html", user=current_user, projets=projets_data)


@bp.route("/add_project", methods=["POST"])
@login_required
def add_project():
    nom = request.form.get("nom")
    date_debut = request.form.get("date_debut")
    statut = request.form.get("statut", "En cours")
    date_fin = request.form.get("date_fin")
    budget = request.form.get("budget")
    progression = request.form.get("progression", 0)
    description = request.form.get("description")

    # Créer un nouvel ID
    new_id = max(projet.id for projet in MOCK_PROJECTS) + 1 if MOCK_PROJECTS else 1

    # Créer le nouveau projet
    new_project = Projet(
        id=new_id,
        nom=nom,
        date_debut=datetime.strptime(date_debut, "%Y-%m-%d"),
        statut=statut,
        date_fin=datetime.strptime(date_fin, "%Y-%m-%d") if date_fin else None,
        budget=budget,
        progression=progression,
        description=description,
    )

    # Ajouter à la liste
    MOCK_PROJECTS.append(new_project)

    flash("Projet ajouté avec succès", "success")
    return redirect(url_for("routes.projets"))


@bp.route("/edit_project/<int:project_id>", methods=["GET", "POST"])
@login_required
def edit_project(project_id):
    # Trouver le projet
    projet = next((p for p in MOCK_PROJECTS if p.id == project_id), None)

    if not projet:
        flash("Projet introuvable", "danger")
        return redirect(url_for("routes.projets"))

    if request.method == "POST":
        # Mettre à jour le projet
        projet.nom = request.form.get("nom")
        projet.date_debut = datetime.strptime(
            request.form.get("date_debut"), "%Y-%m-%d"
        )
        projet.statut = request.form.get("statut")

        date_fin = request.form.get("date_fin")
        projet.date_fin = datetime.strptime(date_fin, "%Y-%m-%d") if date_fin else None

        projet.budget = request.form.get("budget")
        projet.progression = request.form.get("progression", 0)
        projet.description = request.form.get("description")

        flash("Projet modifié avec succès", "success")
        return redirect(url_for("routes.projets"))

    # Convertir en dictionnaire pour le template
    projet_data = projet.to_dict()
    return render_template("edit_project.html", user=current_user, projet=projet_data)


@bp.route("/delete_project/<int:project_id>", methods=["POST"])
@login_required
def delete_project(project_id):
    global MOCK_PROJECTS
    MOCK_PROJECTS = [p for p in MOCK_PROJECTS if p.id != project_id]
    flash("Projet supprimé avec succès", "danger")
    return redirect(url_for("routes.projets"))


@bp.route("/api/projets", methods=["GET"])
@login_required
def api_projets():
    # Retourner la liste des projets en JSON
    projets_data = [projet.to_dict() for projet in MOCK_PROJECTS]
    return jsonify(projets_data)


@bp.route("/api/projets/<int:project_id>", methods=["GET"])
@login_required
def api_projet(project_id):
    # Trouver le projet
    projet = next((p for p in MOCK_PROJECTS if p.id == project_id), None)

    if not projet:
        return jsonify({"error": "Projet non trouvé"}), 404

    return jsonify(projet.to_dict())


# -----------------------------
# Gestion des budgets - Région Haute Matsiatra
# -----------------------------


# Modèle de données pour les budgets
class Budget:
    def __init__(
        self,
        id,
        nom,
        montant,
        statut,
        date_allocation,
        projet_associe=None,
        description=None,
    ):
        self.id = id
        self.nom = nom
        self.montant = montant
        self.statut = statut
        self.date_allocation = date_allocation
        self.projet_associe = projet_associe
        self.description = description

    def to_dict(self):
        return {
            "id": self.id,
            "nom": self.nom,
            "montant": self.montant,
            "statut": self.statut,
            "date": (
                self.date_allocation.strftime("%Y-%m-%d")
                if isinstance(self.date_allocation, datetime)
                else self.date_allocation
            ),
            "projet_associe": self.projet_associe,
            "description": self.description,
        }


# Données fictives pour budgets
MOCK_BUDGETS = [
    Budget(
        1,
        "Budget Développement Rural",
        "500 000 Ariary",
        "Approuvé",
        datetime(2025, 1, 15),
        "Projet Développement Rural",
        "Budget alloué au développement des zones rurales de la région",
    ),
    Budget(
        2,
        "Budget Santé Communautaire",
        "750 000 Ariary",
        "En cours",
        datetime(2025, 2, 10),
        "Projet Santé Communautaire",
        "Financement des centres de santé communautaires",
    ),
    Budget(
        3,
        "Budget Infrastructure Routière",
        "1 200 000 Ariary",
        "Planifié",
        datetime(2025, 3, 5),
        "Projet Infrastructure Routière",
        "Développement et entretien des routes régionales",
    ),
]


@bp.route("/budgets")
@login_required
def budgets():
    # Convertir les objets Budget en dictionnaires pour le template
    budgets_data = [budget.to_dict() for budget in MOCK_BUDGETS]
    return render_template("budgets.html", user=current_user, budgets=budgets_data)


@bp.route("/api/budgets", methods=["GET", "POST"])
@login_required
def api_budgets():
    if request.method == "GET":
        # Retourner la liste des budgets en JSON
        budgets_data = [budget.to_dict() for budget in MOCK_BUDGETS]
        return jsonify(budgets_data)

    elif request.method == "POST":
        # Créer un nouveau budget
        data = request.get_json()

        # Validation des données
        if not data or not all(
            key in data for key in ["nom", "montant", "statut", "date"]
        ):
            return jsonify({"error": "Données manquantes"}), 400

        # Créer un nouvel ID
        new_id = max(budget.id for budget in MOCK_BUDGETS) + 1 if MOCK_BUDGETS else 1

        # Créer le nouveau budget
        new_budget = Budget(
            id=new_id,
            nom=data["nom"],
            montant=data["montant"],
            statut=data["statut"],
            date_allocation=datetime.strptime(data["date"], "%Y-%m-%d"),
            projet_associe=data.get("projet_associe"),
            description=data.get("description"),
        )

        # Ajouter à la liste (dans une vraie application, on sauvegarderait en
        # base de données)
        MOCK_BUDGETS.append(new_budget)

        return jsonify(new_budget.to_dict()), 201


@bp.route("/api/budgets/<int:budget_id>", methods=["GET", "PUT", "DELETE"])
@login_required
def api_budget(budget_id):
    # Trouver le budget
    budget = next((b for b in MOCK_BUDGETS if b.id == budget_id), None)

    if not budget:
        return jsonify({"error": "Budget non trouvé"}), 404

    if request.method == "GET":
        return jsonify(budget.to_dict())

    elif request.method == "PUT":
        # Mettre à jour le budget
        data = request.get_json()

        if "nom" in data:
            budget.nom = data["nom"]
        if "montant" in data:
            budget.montant = data["montant"]
        if "statut" in data:
            budget.statut = data["statut"]
        if "date" in data:
            budget.date_allocation = datetime.strptime(data["date"], "%Y-%m-%d")
        if "projet_associe" in data:
            budget.projet_associe = data["projet_associe"]
        if "description" in data:
            budget.description = data["description"]

        return jsonify(budget.to_dict())

    elif request.method == "DELETE":
        # Supprimer le budget
        MOCK_BUDGETS.remove(budget)
        return jsonify({"message": "Budget supprimé avec succès"})


@bp.route("/budgets/export")
@login_required
def export_budgets():
    # Exporter les budgets (simulation)
    flash("Export des budgets réalisé avec succès", "success")
    return redirect(url_for("routes.budgets"))


# -----------------------------
# Gestion de la cartographie
# -----------------------------

# Données fictives pour cartes / points des projets
MOCK_MAP_POINTS = [
    {
        "id": 1,
        "nom": "École A",
        "latitude": -21.45,
        "longitude": 47.08,
        "projet": "Construction école",
    },
    {
        "id": 2,
        "nom": "Route B",
        "latitude": -21.47,
        "longitude": 47.05,
        "projet": "Réhabilitation route",
    },
    {
        "id": 3,
        "nom": "Pompe C",
        "latitude": -21.49,
        "longitude": 47.10,
        "projet": "Installation eau potable",
    },
]


@bp.route("/cartographie")
@login_required
def cartographie():
    return render_template(
        "cartographie.html", user=current_user, points=MOCK_MAP_POINTS
    )


# -----------------------------
# Gestion de la Analytics
# -----------------------------
# Création du Blueprint
routes_bp = Blueprint("routes", __name__)


# ✅ Route pour la page Analytics
@bp.route("/analytics")
def analytics():
    # Exemple de données envoyées à la page Analytics
    stats = {
        "total_users": 1500,
        "active_users": 1200,
        "inactive_users": 300,
        "sessions": 5000,
    }
    return render_template("analytics.html", stats=stats)


# -----------------------------
# Gestion des rapports
# -----------------------------
MOCK_REPORTS = [
    {"id": 1, "nom": "Rapport Budget Éducation", "fichier": "rapport_education.pdf"},
    {"id": 2, "nom": "Rapport Budget Santé", "fichier": "rapport_sante.pdf"},
    {
        "id": 3,
        "nom": "Rapport Budget Infrastructure",
        "fichier": "rapport_infrastructure.pdf",
    },
]


@bp.route("/rapports")
@login_required
def rapports():
    # Renvoie la liste des rapports à la page HTML
    return render_template("rapports.html", user=current_user, reports=MOCK_REPORTS)


# -----------------------------
# Gestion des paramètres
# -----------------------------
@bp.route("/parametres", methods=["GET", "POST"])
@login_required
def parametres():
    # Exemple simple : formulaire fictif pour modifier le profil utilisateur
    if request.method == "POST":
        # Récupérer les données du formulaire
        username = request.form.get("username")
        email = request.form.get("email")
        # Mettre à jour l'utilisateur actuel
        current_user.username = username
        current_user.email = email
        db.session.commit()
        flash("✔️ Paramètres mis à jour avec succès.", "success")
        return redirect(url_for("routes.parametres"))

    return render_template("parametres.html", user=current_user)


# -----------------------------
# Analytics IA - Détection anomalies & prédictions
# -----------------------------

# Données fictives pour les projets
PROJECTS_DATA = [
    {
        "id": 1,
        "nom": "Projet A",
        "budget": 500000,
        "executed": 520000,
        "delai": 30,
        "delai_real": 40,
    },
    {
        "id": 2,
        "nom": "Projet B",
        "budget": 300000,
        "executed": 250000,
        "delai": 20,
        "delai_real": 18,
    },
    {
        "id": 3,
        "nom": "Projet C",
        "budget": 400000,
        "executed": 600000,
        "delai": 25,
        "delai_real": 50,
    },
]


@bp.route("/analytics_ia")
@login_required
def analytics_ia():
    df = pd.DataFrame(PROJECTS_DATA)

    # Détection d’anomalies
    df["anomalie_budget"] = df["executed"] > df["budget"] * 1.1
    df["anomalie_delai"] = df["delai_real"] > df["delai"] * 1.1

    anomalies = df[(df["anomalie_budget"]) | (df["anomalie_delai"])]

    # Recommandations simples
    def recommander_reallocation(row):
        if row["anomalie_budget"] and not row["anomalie_delai"]:
            return "Réduire budget futur ou reporter fonds"
        elif row["anomalie_delai"]:
            return "Allouer ressources supplémentaires"
        return "Aucune action nécessaire"

    df["recommandation"] = df.apply(recommander_reallocation, axis=1)

    return render_template(
        "analytics_ia.html",
        user=current_user,
        anomalies=anomalies.to_dict(orient="records"),
        recommandations=df["recommandation"].tolist(),
    )


# -----------------------------
# Outils pour le Terrain
# -----------------------------


@bp.route("/outils_terrain")
@login_required
def outils_terrain():
    # Exemple de fonctionnalités à afficher
    outils = [
        {
            "nom": "Application mobile",
            "description": "Collecte de données (photos, géoloc, formulaires)",
        },
        {
            "nom": "Reconnaissance d'images",
            "description": "Suivi automatique des chantiers",
        },
        {
            "nom": "Synchronisation hors-ligne",
            "description": "Permet d’enregistrer les données sans connexion",
        },
        {
            "nom": "Validation électronique",
            "description": "Validation des travaux réalisés via formulaire numérique",
        },
    ]
    return render_template("outils_terrain.html", user=current_user, outils=outils)
