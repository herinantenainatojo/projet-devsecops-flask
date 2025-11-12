document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const addProjectBtn = document.getElementById('add-project-btn');
    const emptyAddProjectBtn = document.getElementById('empty-add-project');
    const addProjectModal = document.getElementById('add-project-modal');
    const viewProjectModal = document.getElementById('view-project-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const closeDetailsModalBtn = document.getElementById('close-details-modal');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    const cancelProjectBtn = document.getElementById('cancel-project');
    const projectForm = document.getElementById('project-form');
    const progressSlider = document.getElementById('project-progress');
    const progressValue = document.getElementById('progress-value');
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    const editProjectBtn = document.getElementById('edit-project-btn');

    // Mise à jour de la valeur de progression
    if (progressSlider && progressValue) {
        progressSlider.addEventListener('input', function() {
            progressValue.textContent = this.value + '%';
        });
    }

    // Ouvrir le modal d'ajout
    function openProjectModal() {
        addProjectModal.style.display = 'flex';
        document.getElementById('project-name').focus();

        // Définir la date du jour comme date de début par défaut
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('project-start').value = today;
    }

    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', openProjectModal);
    }

    if (emptyAddProjectBtn) {
        emptyAddProjectBtn.addEventListener('click', openProjectModal);
    }

    // Ouvrir le modal de détails
    if (viewDetailsButtons) {
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', function() {
                const projectId = this.getAttribute('data-project-id');
                loadProjectDetails(projectId);
                viewProjectModal.style.display = 'flex';
            });
        });
    }

    // Charger les détails du projet
    function loadProjectDetails(projectId) {
        // Dans une application réelle, on ferait une requête API
        // Pour cette démo, on va simuler avec les données existantes

        // Trouver le projet correspondant (simulation)
        const projectRow = document.querySelector(`.view-details-btn[data-project-id="${projectId}"]`).closest('tr');
        const projectName = projectRow.querySelector('.project-title').textContent.trim();
        const startDate = projectRow.querySelector('.project-date:nth-child(2)').textContent;
        const endDate = projectRow.querySelector('.project-date:nth-child(3)').textContent;
        const status = projectRow.querySelector('.project-status').textContent.trim();
        const budget = projectRow.querySelector('.project-budget').textContent;
        const progress = projectRow.querySelector('.progress-text').textContent;

        // Remplir les détails
        document.getElementById('detail-name').textContent = projectName;
        document.getElementById('detail-start-date').textContent = startDate;
        document.getElementById('detail-end-date').textContent = endDate;
        document.getElementById('detail-status').textContent = status;
        document.getElementById('detail-budget').textContent = budget;
        document.getElementById('detail-progress').textContent = progress;

        // Description factice (dans une vraie app, viendrait de la base de données)
        const descriptions = {
            '1': 'Construction d\'une école primaire de 6 salles de classe avec bureau administratif et sanitaires dans le village d\'Ankazo. Le projet comprend également la construction d\'un terrain de sport et la plantation d\'arbres pour ombrager la cour.',
            '2': 'Réhabilitation de 15km de la Route Nationale 7, comprenant le reprofilage de la chaussée, le renforcement des ponts et la pose de signalisation routière. Ce projet vise à améliorer la connectivité et la sécurité routière dans la région.',
            '3': 'Installation de systèmes d\'adduction d\'eau potable dans 3 villages reculés de la région, comprenant forages, réservoirs de stockage et bornes fontaines. Le projet inclut également la formation des comités de gestion de l\'eau.'
        };

        document.getElementById('detail-description').textContent = descriptions[projectId] || 'Aucune description disponible.';

        // Mettre à jour le lien de modification
        if (editProjectBtn) {
            editProjectBtn.href = `/edit_project/${projectId}`;
        }
    }

    // Fermer les modals
    function closeModal() {
        addProjectModal.style.display = 'none';
        if (projectForm) {
            projectForm.reset();
            if (progressValue) {
                progressValue.textContent = '0%';
            }
        }
    }

    function closeDetailsModal() {
        viewProjectModal.style.display = 'none';
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (closeDetailsModalBtn) {
        closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
    }

    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener('click', closeDetailsModal);
    }

    if (cancelProjectBtn) {
        cancelProjectBtn.addEventListener('click', closeModal);
    }

    // Fermer les modals en cliquant à l'extérieur
    if (addProjectModal) {
        addProjectModal.addEventListener('click', function(e) {
            if (e.target === addProjectModal) {
                closeModal();
            }
        });
    }

    if (viewProjectModal) {
        viewProjectModal.addEventListener('click', function(e) {
            if (e.target === viewProjectModal) {
                closeDetailsModal();
            }
        });
    }

    // Fermer les modals avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (addProjectModal.style.display === 'flex') {
                closeModal();
            }
            if (viewProjectModal.style.display === 'flex') {
                closeDetailsModal();
            }
        }
    });

    // Filtrage des projets
    const statusFilter = document.getElementById('status-filter');
    const sortFilter = document.getElementById('sort-filter');

    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }

    function applyFilters() {
        const statusValue = statusFilter ? statusFilter.value : '';
        const sortValue = sortFilter ? sortFilter.value : '';

        const rows = document.querySelectorAll('.data-table tbody tr:not(.no-data)');

        rows.forEach(row => {
            const status = row.querySelector('.project-status').textContent.trim();

            // Filtrage par statut
            if (statusValue && status !== statusValue) {
                row.style.display = 'none';
            } else {
                row.style.display = '';
            }
        });

        // Tri des données (simplifié)
        if (sortValue) {
            const tbody = document.querySelector('.data-table tbody');
            const sortedRows = Array.from(rows).filter(row => row.style.display !== 'none');

            if (sortValue === 'date') {
                sortedRows.sort((a, b) => {
                    const dateA = new Date(a.querySelector('.project-date').textContent);
                    const dateB = new Date(b.querySelector('.project-date').textContent);
                    return dateB - dateA;
                });
            } else if (sortValue === 'nom') {
                sortedRows.sort((a, b) => {
                    const nameA = a.querySelector('.project-title').textContent.trim();
                    const nameB = b.querySelector('.project-title').textContent.trim();
                    return nameA.localeCompare(nameB);
                });
            } else if (sortValue === 'statut') {
                sortedRows.sort((a, b) => {
                    const statusA = a.querySelector('.project-status').textContent.trim();
                    const statusB = b.querySelector('.project-status').textContent.trim();
                    return statusA.localeCompare(statusB);
                });
            }

            // Réorganiser les lignes
            sortedRows.forEach(row => tbody.appendChild(row));
        }
    }

    // Animation des barres de progression
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }

    // Démarrer l'animation des barres de progression
    setTimeout(animateProgressBars, 500);

    // Gestion des notifications (si non déjà inclus dans budgets.js)
    if (typeof showNotification === 'undefined') {
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

        // Fonction pour afficher les notifications
        window.showNotification = function(message, type = 'info') {
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
        };

        function closeNotification(notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }
});
