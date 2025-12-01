# wsgi.py
from run import app

if __name__ == "__main__":
    # Pour le développement local seulement
    import os
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)
else:
    # Pour gunicorn
    application = app