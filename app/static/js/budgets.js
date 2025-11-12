document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const addBudgetBtn = document.getElementById('add-budget-btn');
    const addBudgetModal = document.getElementById('add-budget-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelBudgetBtn = document.getElementById('cancel-budget');
    const saveBudgetBtn = document.getElementById('save-budget');
    const budgetForm = document.getElementById('budget-form');

    // Ouvrir le modal
    addBudgetBtn.addEventListener('click', function() {
        addBudgetModal.style.display = 'flex';
        document.getElementById('budget-name').focus();
    });

    // Fermer le modal
    function closeModal() {
        addBudgetModal.style.display = 'none';
        budgetForm.reset();
    }

    closeModalBtn.addEventListener('click', closeModal);
    cancelBudgetBtn.addEventListener('click', closeModal);

    // Fermer le modal en cliquant à l'extérieur
    addBudgetModal.addEventListener('click', function(e) {
        if (e.target === addBudgetModal) {
            closeModal();
        }
    });

    // Fermer le modal avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && addBudgetModal.style.display === 'flex') {
            closeModal();
        }
    });

    // Soumettre le formulaire
    saveBudgetBtn.addEventListener('click', function() {
        if (budgetForm.checkValidity()) {
            // Récupérer les valeurs du formulaire
            const formData = {
                nom: document.getElementById('budget-name').value,
                montant: document.getElementById('budget-amount').value + '€',
                date: document.getElementById('budget-date').value,
                statut: document.getElementById('budget-status').value,
                projet: document.getElementById('budget-project').value,
                description: document.getElementById('budget-description').value
            };

            // Simulation d'envoi au serveur
            simulateApiCall(formData)
                .then(response => {
                    // Afficher un message de succès
                    showNotification('Budget créé avec succès!', 'success');

                    // Fermer le modal et réinitialiser le formulaire
                    closeModal();

                    // Recharger la page (dans une vraie application, on mettrait à jour le tableau)
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                })
                .catch(error => {
                    showNotification('Erreur lors de la création du budget: ' + error.message, 'error');
                });
        } else {
            // Afficher les erreurs de validation
            budgetForm.reportValidity();
        }
    });

    // Fonction pour simuler un appel API
    function simulateApiCall(data) {
        return new Promise((resolve, reject) => {
            // Simuler un délai réseau
            setTimeout(() => {
                // Simuler une erreur aléatoire (10% de chance)
                if (Math.random() < 0.1) {
                    reject(new Error('Erreur de connexion'));
                } else {
                    resolve({ status: 'success', data: data });
                }
            }, 1000);
        });
    }

    // Fonction pour afficher les notifications
    function showNotification(message, type = 'info') {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Ajouter au body
        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Fermer la notification après 5 secondes
        const timeout = setTimeout(() => {
            closeNotification(notification);
        }, 5000);

        // Fermer en cliquant sur le bouton
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeout);
            closeNotification(notification);
        });
    }

    function closeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Gestion des actions sur les budgets
    const actionButtons = document.querySelectorAll('.budget-actions .btn-icon');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.title;
            const budgetRow = this.closest('tr');
            const budgetName = budgetRow.querySelector('.budget-title').textContent.trim();

            switch(action) {
                case 'Modifier':
                    showNotification(`Ouverture de l'édition du budget: ${budgetName}`, 'info');
                    break;
                case 'Supprimer':
                    if (confirm(`Êtes-vous sûr de vouloir supprimer le budget "${budgetName}"? Cette action est irréversible.`)) {
                        // Simulation de suppression
                        showNotification(`Budget "${budgetName}" supprimé avec succès`, 'success');
                        setTimeout(() => {
                            budgetRow.remove();

                            // Vérifier s'il reste des budgets
                            const remainingBudgets = document.querySelectorAll('.data-table tbody tr');
                            if (remainingBudgets.length === 1 && remainingBudgets[0].querySelector('.no-data')) {
                                window.location.reload();
                            }
                        }, 1500);
                    }
                    break;
                case 'Voir détails':
                    showNotification(`Affichage des détails du budget: ${budgetName}`, 'info');
                    break;
            }
        });
    });

    // Filtrage des budgets
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', applyFilters);
    });

    function applyFilters() {
        const statusFilter = document.querySelector('.filter-select:first-child').value;
        const sortFilter = document.querySelector('.filter-select:last-child').value;

        const rows = document.querySelectorAll('.data-table tbody tr:not(.no-data)');

        rows.forEach(row => {
            const status = row.querySelector('.budget-status').textContent.trim();

            // Filtrage par statut
            if (statusFilter && status !== statusFilter) {
                row.style.display = 'none';
            } else {
                row.style.display = '';
            }
        });

        // Tri des données (simplifié)
        if (sortFilter) {
            const tbody = document.querySelector('.data-table tbody');
            const sortedRows = Array.from(rows).filter(row => row.style.display !== 'none');

            if (sortFilter === 'date') {
                sortedRows.sort((a, b) => {
                    const dateA = new Date(a.querySelector('.budget-date').textContent);
                    const dateB = new Date(b.querySelector('.budget-date').textContent);
                    return dateB - dateA;
                });
            } else if (sortFilter === 'montant') {
                sortedRows.sort((a, b) => {
                    const amountA = parseFloat(a.querySelector('.budget-amount').textContent);
                    const amountB = parseFloat(b.querySelector('.budget-amount').textContent);
                    return amountB - amountA;
                });
            } else if (sortFilter === 'nom') {
                sortedRows.sort((a, b) => {
                    const nameA = a.querySelector('.budget-title').textContent.trim();
                    const nameB = b.querySelector('.budget-title').textContent.trim();
                    return nameA.localeCompare(nameB);
                });
            }

            // Réorganiser les lignes
            sortedRows.forEach(row => tbody.appendChild(row));
        }
    }

    // Styles pour les notifications
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 10000;
            border-left: 4px solid #6c757d;
        }

        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }

        .notification-success {
            border-left-color: #2E7D32;
        }

        .notification-error {
            border-left-color: #D32F2F;
        }

        .notification-info {
            border-left-color: #0288D1;
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .notification-success .notification-content i {
            color: #2E7D32;
        }

        .notification-error .notification-content i {
            color: #D32F2F;
        }

        .notification-info .notification-content i {
            color: #0288D1;
        }

        .notification-close {
            background: none;
            border: none;
            cursor: pointer;
            color: #6c757d;
            margin-left: 1rem;
        }

        @media (max-width: 576px) {
            .notification {
                left: 20px;
                right: 20px;
                min-width: auto;
            }
        }
    `;
    document.head.appendChild(notificationStyles);
});
