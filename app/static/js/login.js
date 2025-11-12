// Fonction pour basculer la visibilité du mot de passe
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.textContent = '🙈';
        passwordIcon.setAttribute('aria-label', 'Masquer le mot de passe');
    } else {
        passwordInput.type = 'password';
        passwordIcon.textContent = '👁️';
        passwordIcon.setAttribute('aria-label', 'Afficher le mot de passe');
    }
}

// Fonction pour gérer la soumission du formulaire
function handleFormSubmit(event) {
    const submitBtn = document.getElementById('submitBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Validation basique côté client
    let isValid = true;

    if (!usernameInput.value.trim()) {
        showInputError(usernameInput, 'Le nom d\'utilisateur est requis');
        isValid = false;
    }

    if (!passwordInput.value.trim()) {
        showInputError(passwordInput, 'Le mot de passe est requis');
        isValid = false;
    }

    if (!isValid) {
        event.preventDefault();
        return;
    }

    // Ajouter l'état de chargement
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Connexion en cours...';
}

// Fonction pour afficher les erreurs de validation
function showInputError(input, message) {
    input.style.borderColor = 'var(--error-color)';
    input.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';

    // Supprimer les messages d'erreur existants
    const existingError = input.parentElement.querySelector('.input-error');
    if (existingError) {
        existingError.remove();
    }

    // Créer un nouveau message d'erreur
    const errorElement = document.createElement('div');
    errorElement.className = 'input-error';
    errorElement.style.color = 'var(--error-color)';
    errorElement.style.fontSize = '14px';
    errorElement.style.marginTop = '8px';
    errorElement.textContent = message;

    input.parentElement.appendChild(errorElement);
}

// Fonction pour effacer les erreurs de validation
function clearInputError(input) {
    input.style.borderColor = '';
    input.style.boxShadow = '';

    const errorElement = input.parentElement.querySelector('.input-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Fonction pour supprimer automatiquement les messages flash
function autoRemoveMessages() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });
}

// Fonction pour initialiser l'application
function initLoginApp() {
    // Initialiser le bouton de basculement du mot de passe
    const passwordToggle = document.getElementById('passwordToggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', togglePassword);
    }

    // Initialiser la validation du formulaire
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleFormSubmit);
    }

    // Effacer les erreurs lors de la saisie
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearInputError(this);
        });
    });

    // Supprimer automatiquement les messages flash
    autoRemoveMessages();

    // Ajouter la prise en charge du clavier pour l'accessibilité
    document.addEventListener('keydown', function(event) {
        // Enter key pour soumettre le formulaire
        if (event.key === 'Enter' && !event.shiftKey) {
            const focusedElement = document.activeElement;
            if (focusedElement.tagName !== 'TEXTAREA') {
                event.preventDefault();
                loginForm.dispatchEvent(new Event('submit'));
            }
        }

        // Escape key pour réinitialiser
        if (event.key === 'Escape') {
            const focusedElement = document.activeElement;
            if (focusedElement.tagName === 'INPUT') {
                focusedElement.blur();
            }
        }
    });

    // Focus sur le premier champ de formulaire
    const firstInput = document.querySelector('input');
    if (firstInput) {
        setTimeout(() => {
            firstInput.focus();
        }, 100);
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initLoginApp);

// Gestion des erreurs de chargement d'image
document.addEventListener('error', function(event) {
    if (event.target.tagName === 'IMG' && event.target.classList.contains('region-logo')) {
        console.warn('Logo de la région non trouvé. Utilisation du texte alternatif.');
        event.target.style.display = 'none';
        const logoText = document.querySelector('.logo-text');
        if (logoText) {
            logoText.style.fontSize = '24px';
            logoText.style.marginTop = '20px';
        }
    }
}, true);
