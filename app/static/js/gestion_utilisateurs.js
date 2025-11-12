// Variables globales
let currentUserId = null;
const users = [
    { id: 1, nom: "Jean Dupont", email: "jean@example.com", role: "admin", statut: "active" },
    { id: 2, nom: "Marie Lambert", email: "marie@example.com", role: "manager", statut: "active" },
    { id: 3, nom: "Paul Martin", email: "paul@example.com", role: "user", statut: "inactive" }
];

// Fonction pour afficher un message flash
function showFlashMessage(message, type = 'success') {
    const flashMessage = document.getElementById('flashMessage');
    const flashText = document.getElementById('flashText');

    flashText.textContent = message;
    flashMessage.className = `flash-message flash-${type}`;
    flashMessage.style.display = 'flex';

    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
        flashMessage.style.display = 'none';
    }, 5000);
}

// Fonction pour initialiser l'application
function initApp() {
    // Gestion de l'affichage du formulaire
    document.getElementById('addUserBtn').addEventListener('click', function() {
        const form = document.getElementById('userForm');
        const formTitle = document.getElementById('formTitle');
        const formElement = document.getElementById('userFormElement');

        formTitle.textContent = 'Ajouter un Utilisateur';
        formElement.reset();
        document.getElementById('userId').value = '';
        currentUserId = null;
        form.style.display = 'block';

        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
    });

    // Gestion de l'annulation du formulaire
    document.getElementById('cancelBtn').addEventListener('click', function() {
        document.getElementById('userForm').style.display = 'none';
        document.getElementById('userFormElement').reset();
        currentUserId = null;
    });

    // Gestion de la soumission du formulaire
    document.getElementById('userFormElement').addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = {
            id: document.getElementById('userId').value,
            nom: document.getElementById('nom').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value,
            statut: document.getElementById('statut').value
        };

        // Simulation de sauvegarde
        if (formData.id) {
            // Modification
            showFlashMessage('Utilisateur modifié avec succès!', 'success');
        } else {
            // Ajout
            formData.id = Date.now(); // ID unique
            showFlashMessage('Utilisateur ajouté avec succès!', 'success');
        }

        this.reset();
        this.parentElement.style.display = 'none';
        currentUserId = null;
    });

    // Gestion des boutons de modification
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            const user = users.find(u => u.id === userId);

            if (user) {
                const form = document.getElementById('userForm');
                const formTitle = document.getElementById('formTitle');

                formTitle.textContent = 'Modifier l\'Utilisateur';
                form.style.display = 'block';

                // Remplir le formulaire avec les données de l'utilisateur
                document.getElementById('userId').value = user.id;
                document.getElementById('nom').value = user.nom;
                document.getElementById('email').value = user.email;
                document.getElementById('role').value = user.role;
                document.getElementById('statut').value = user.statut;

                currentUserId = user.id;

                // Scroll to form
                form.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Gestion des boutons de suppression
    const deleteModal = document.getElementById('deleteModal');
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            currentUserId = parseInt(this.getAttribute('data-id'));
            deleteModal.classList.add('active');
        });
    });

    // Gestion de la fermeture du modal
    document.querySelector('.modal-close').addEventListener('click', function() {
        deleteModal.classList.remove('active');
        currentUserId = null;
    });

    document.getElementById('modalCancelBtn').addEventListener('click', function() {
        deleteModal.classList.remove('active');
        currentUserId = null;
    });

    document.getElementById('modalConfirmBtn').addEventListener('click', function() {
        if (currentUserId) {
            // Simulation de suppression
            showFlashMessage('Utilisateur supprimé avec succès!', 'success');
        }
        deleteModal.classList.remove('active');
        currentUserId = null;
    });

    // Fermer le modal en cliquant à l'extérieur
    window.addEventListener('click', function(event) {
        if (event.target === deleteModal) {
            deleteModal.classList.remove('active');
            currentUserId = null;
        }
    });
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initApp);
