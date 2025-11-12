# Projet DevSecOps - Application Flask

## Description
Mise en place d'une infrastructure DevSecOps avec surveillance automatisée des failles de sécurité pour une application Flask de gestion de budgets.

## Technologies Utilisées
- **Framework** : Flask (Python)
- **Sécurité** : Pre-commit hooks, Bandit, detect-secrets
- **CI/CD** : GitHub Actions (à venir)
- **Monitoring** : ELK Stack, Prometheus (à venir)

## Outils de Sécurité Intégrés
- **SAST** : Bandit - Analyse statique du code Python
- **SCA** : Safety - Vérification des dépendances vulnérables
- **Secrets Scanning** : detect-secrets - Détection de credentials hardcodés
- **Code Quality** : Black, Flake8

## Installation
```bash
# Cloner le projet
git clone https://github.com/herinantenainatojo/projet-devsecops-flask.git
cd projet-devsecops-flask

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Installer les hooks pre-commit
pre-commit install

# Lancer l'application
python run.py
```

## Sécurité
Tous les commits sont automatiquement vérifiés par :
- Analyse de vulnérabilités (Bandit)
- Détection de secrets hardcodés
- Vérification du style de code

## Auteur
Tojo - Projet Master 2
