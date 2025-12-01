import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.testing = True
    return app.test_client()

def test_home(client):
    # Suivre la redirection pour obtenir le code final
    response = client.get('/', follow_redirects=True)
    assert response.status_code == 200
