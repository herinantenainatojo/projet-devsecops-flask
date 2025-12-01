# wsgi.py - Point d'entrée pour Railway/Gunicorn

from run import app

# Cette variable 'application' est nécessaire pour certains serveurs WSGI
application = app

if __name__ == "__main__":
    # Pour le développement local
    import os
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)