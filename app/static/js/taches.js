/**
 * Système de Gestion des Tâches - Région Haute Matsiatra
 * JavaScript moderne avec fonctionnalités avancées
 */

class TaskManager {
    constructor() {
        this.tasks = [];
        this.filteredTasks = [];
        this.currentPage = 1;
        this.tasksPerPage = 10;
        this.currentFilter = { status: '', sort: '', search: '' };
        this.selectedTaskId = null;

        this.init();
    }

    /**
     * Initialisation de l'application
     */
    init() {
        this.loadInitialData();
        this.bindEvents();
        this.setupAnimations();
        this.calculateOverdueTasks();
        this.initializeTooltips();
        this.setupKeyboardShortcuts();

        // Délai pour les animations d'entrée
        setTimeout(() => {
            this.animateElements();
        }, 100);
    }

    /**
     * Chargement des données initiales
     */
    loadInitialData() {
        // Récupération des tâches depuis le DOM
        const taskRows = document.querySelectorAll('.task-row');
        this.tasks = Array.from(taskRows).map((row, index) => ({
            id: row.querySelector('.edit-task-btn')?.dataset.taskId || index,
            title: row.querySelector('.task-title').textContent.trim(),
            description: row.querySelector('.task-description')?.textContent.trim() || '',
            date: row.querySelector('.task-date').textContent.trim(),
            priority: row.dataset.priority || 'medium',
            status: row.dataset.status || 'en-cours',
            project: row.querySelector('.task-project').textContent.trim(),
            assignee: row.querySelector('.task-assignee').textContent.trim(),
            element: row
        }));

        this.filteredTasks = [...this.tasks];
        this.updatePagination();
    }

    /**
     * Liaison des événements
     */
    bindEvents() {
        // Boutons d'action principaux
        this.bindElement('#add-task-btn', 'click', () => this.openTaskModal());
        this.bindElement('#empty-add-task', 'click', () => this.openTaskModal());
        this.bindElement('#export-btn', 'click', () => this.exportTasks());

        // Recherche et filtres
        this.bindElement('#searchInput', 'input', (e) => this.handleSearch(e.target.value));
        this.bindElement('#status-filter', 'change', (e) => this.handleStatusFilter(e.target.value));
        this.bindElement('#sort-filter', 'change', (e) => this.handleSort(e.target.value));

        // Modal de tâche
        this.bindElement('#close-modal', 'click', () => this.closeTaskModal());
        this.bindElement('#cancel-task', 'click', () => this.closeTaskModal());
        this.bindElement('#task-form', 'submit', (e) => this.handleTaskSubmit(e));

        // Modal de suppression
        this.bindElement('#close-delete-modal', 'click', () => this.closeDeleteModal());
        this.bindElement('#cancel-delete', 'click', () => this.closeDeleteModal());
        this.bindElement('#confirm-delete', 'click', () => this.confirmDelete());

        // Pagination
        this.bindElement('#prev-page', 'click', () => this.previousPage());
        this.bindElement('#next-page', 'click', () => this.nextPage());

        // Actions sur les tâches (délégation d'événements)
        this.bindElement('.data-table', 'click', (e) => this.handleTableClick(e));

        // Fermeture des modals en cliquant à l'extérieur
        this.bindElement('.modal', 'click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Bouton de déconnexion
        this.bindElement('.logout-btn', 'click', () => this.handleLogout());

        // Responsive: ajustement automatique
        window.addEventListener('resize', () => this.handleResize());

        // Détection de changement d'onglet pour mettre à jour les statistiques
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshStats();
            }
        });
    }

    /**
     * Utilitaire pour lier des éléments avec gestion d'erreur
     */
    bindElement(selector, event, handler) {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    /**
     * Gestion des clics dans le tableau (délégation)
     */
    handleTableClick(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const taskId = button.dataset.taskId;
        if (!taskId) return;

        e.preventDefault();

        if (button.classList.contains('edit-task-btn')) {
            this.editTask(taskId);
        } else if (button.classList.contains('delete-task-btn')) {
            this.deleteTask(taskId);
        } else if (button.classList.contains('view-task-btn')) {
            this.viewTask(taskId);
        } else if (button.classList.contains('complete-task-btn')) {
            this.completeTask(taskId);
        }
    }

    /**
     * Configuration des raccourcis clavier
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: Nouvelle tâche
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.openTaskModal();
            }

            // Échap: Fermer les modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }

            // Ctrl/Cmd + E: Exporter
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.exportTasks();
            }

            // Ctrl/Cmd + F: Focus sur la recherche
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.querySelector('#searchInput');
                if (searchInput) searchInput.focus();
            }
        });
    }

    /**
     * Ouverture du modal de tâche
     */
    openTaskModal(taskData = null) {
        const modal = document.querySelector('#task-modal');
        const form = document.querySelector('#task-form');
        const title = document.querySelector('#modal-title');
        const saveBtn = document.querySelector('#save-task');

        if (!modal || !form) return;

        // Reset du formulaire
        form.reset();

        if (taskData) {
            // Mode édition
            title.innerHTML = '<i class="fas fa-edit"></i> Modifier la Tâche';
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Mettre à jour';
            this.populateForm(taskData);
        } else {
            // Mode création
            title.innerHTML = '<i class="fas fa-plus-circle"></i> Nouvelle Tâche';
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Enregistrer';

            // Valeurs par défaut
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.querySelector('#task-date');
            if (dateInput) dateInput.value = today;
        }

        this.showModal(modal);

        // Focus sur le premier champ
        const firstInput = form.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 300);
        }
    }

    /**
     * Remplissage du formulaire avec les données existantes
     */
    populateForm(taskData) {
        const fields = {
            '#task-id': taskData.id,
            '#task-title': taskData.title,
            '#task-description': taskData.description,
            '#task-date': taskData.date,
            '#task-priority': taskData.priority,
            '#task-status': taskData.status.replace('-', ' '),
            '#task-project': taskData.project,
            '#task-assignee': taskData.assignee
        };

        Object.entries(fields).forEach(([selector, value]) => {
            const element = document.querySelector(selector);
            if (element && value) {
                element.value = value;
            }
        });
    }

    /**
     * Fermeture du modal de tâche
     */
    closeTaskModal() {
        const modal = document.querySelector('#task-modal');
        this.hideModal(modal);
    }

    /**
     * Gestion de la soumission du formulaire
     */
    handleTaskSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const taskData = Object.fromEntries(formData.entries());

        // Validation
        if (!this.validateTaskData(taskData)) {
            return;
        }

        // Animation de chargement
        const saveBtn = document.querySelector('#save-task');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
        saveBtn.disabled = true;

        // Simulation de l'enregistrement
        setTimeout(() => {
            if (taskData.task_id) {
                this.updateTask(taskData);
            } else {
                this.createTask(taskData);
            }

            this.showNotification('Tâche enregistrée avec succès!', 'success');
            this.closeTaskModal();

            // Reset du bouton
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 1000);
    }

    /**
     * Validation des données de tâche
     */
    validateTaskData(data) {
        const errors = [];

        if (!data.titre || data.titre.trim().length < 3) {
            errors.push('Le titre doit contenir au moins 3 caractères');
        }

        if (!data.date) {
            errors.push('La date limite est obligatoire');
        } else {
            const taskDate = new Date(data.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (taskDate < today && data.statut !== 'Terminé') {
                const confirm = window.confirm('La date limite est dans le passé. Voulez-vous continuer ?');
                if (!confirm) return false;
            }
        }

        if (errors.length > 0) {
            this.showNotification(errors.join('\n'), 'error');
            return false;
        }

        return true;
    }

    /**
     * Création d'une nouvelle tâche
     */
    createTask(data) {
        const newTask = {
            id: Date.now().toString(),
            title: data.titre,
            description: data.description || '',
            date: data.date,
            priority: data.priorite,
            status: data.statut.toLowerCase().replace(' ', '-'),
            project: data.projet || 'Non assigné',
            assignee: data.assignee || 'Non assigné'
        };

        this.tasks.unshift(newTask);
        this.addTaskToDOM(newTask);
        this.applyFilters();
        this.refreshStats();
        this.animateNewTask(newTask.id);
    }

    /**
     * Mise à jour d'une tâche existante
     */
    updateTask(data) {
        const taskIndex = this.tasks.findIndex(t => t.id === data.task_id);
        if (taskIndex === -1) return;

        const updatedTask = {
            ...this.tasks[taskIndex],
            title: data.titre,
            description: data.description || '',
            date: data.date,
            priority: data.priorite,
            status: data.statut.toLowerCase().replace(' ', '-'),
            project: data.projet || 'Non assigné',
            assignee: data.assignee || 'Non assigné'
        };

        this.tasks[taskIndex] = updatedTask;
        this.updateTaskInDOM(updatedTask);
        this.applyFilters();
        this.refreshStats();
    }

    /**
     * Ajout d'une tâche au DOM
     */
    addTaskToDOM(task) {
        const tbody = document.querySelector('.data-table tbody');
        if (!tbody) return;

        // Supprimer le message "Aucune tâche" si présent
        const noDataRow = tbody.querySelector('.no-data');
        if (noDataRow) {
            noDataRow.parentElement.remove();
        }

        const row = this.createTaskRow(task);
        tbody.insertBefore(row, tbody.firstChild);

        // Mise à jour de la référence
        task.element = row;
    }

    /**
     * Création d'une ligne de tâche
     */
    createTaskRow(task) {
        const row = document.createElement('tr');
        row.className = 'task-row animate-fade-in';
        row.dataset.status = task.status;
        row.dataset.priority = task.priority;

        const isOverdue = this.isTaskOverdue(task);
        const priorityClass = task.priority || 'medium';
        const statusDisplay = task.status.replace('-', ' ');
        const statusClass = task.status;

        row.innerHTML = `
            <td class="task-title">
                <i class="fas fa-task"></i>
                ${this.escapeHtml(task.title)}
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
            </td>
            <td class="task-date ${isOverdue ? 'overdue' : ''}">
                ${task.date}
                ${isOverdue ? '<span class="overdue-badge">En retard</span>' : ''}
            </td>
            <td class="task-priority">
                <span class="priority-badge priority-${priorityClass}">
                    ${this.formatPriority(task.priority)}
                </span>
            </td>
            <td class="task-status">
                <span class="status-badge status-${statusClass}">
                    ${this.formatStatus(statusDisplay)}
                </span>
            </td>
            <td class="task-project">${this.escapeHtml(task.project)}</td>
            <td class="task-assignee">${this.escapeHtml(task.assignee)}</td>
            <td class="task-actions">
                <button class="btn-icon edit-task-btn" title="Modifier" data-task-id="${task.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete-task-btn" title="Supprimer" data-task-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-icon view-task-btn" title="Voir détails" data-task-id="${task.id}">
                    <i class="fas fa-eye"></i>
                </button>
                ${task.status !== 'terminé' ? `
                <button class="btn-icon complete-task-btn" title="Marquer comme terminé" data-task-id="${task.id}">
                    <i class="fas fa-check"></i>
                </button>` : ''}
            </td>
        `;

        return row;
    }

    /**
     * Mise à jour d'une tâche dans le DOM
     */
    updateTaskInDOM(task) {
        const row = task.element;
        if (!row) return;

        // Animation de mise à jour
        row.style.transform = 'scale(0.98)';
        row.style.transition = 'transform 0.2s ease';

        setTimeout(() => {
            const newRow = this.createTaskRow(task);
            row.parentNode.replaceChild(newRow, row);
            task.element = newRow;

            // Animation de retour
            newRow.style.transform = 'scale(1)';
            newRow.classList.add('animate-slide-in');
        }, 200);
    }

    /**
     * Édition d'une tâche
     */
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.openTaskModal(task);
    }

    /**
     * Suppression d'une tâche
     */
    deleteTask(taskId) {
        this.selectedTaskId = taskId;
        const modal = document.querySelector('#delete-modal');
        this.showModal(modal);
    }

    /**
     * Confirmation de suppression
     */
    confirmDelete() {
        if (!this.selectedTaskId) return;

        const taskIndex = this.tasks.findIndex(t => t.id === this.selectedTaskId);
        if (taskIndex === -1) return;

        const task = this.tasks[taskIndex];

        // Animation de suppression
        if (task.element) {
            task.element.style.transform = 'translateX(-100%)';
            task.element.style.opacity = '0';
            task.element.style.transition = 'all 0.3s ease';

            setTimeout(() => {
                task.element.remove();
            }, 300);
        }

        this.tasks.splice(taskIndex, 1);
        this.applyFilters();
        this.refreshStats();
        this.closeDeleteModal();
        this.showNotification('Tâche supprimée avec succès!', 'success');

        this.selectedTaskId = null;
    }

    /**
     * Fermeture du modal de suppression
     */
    closeDeleteModal() {
        const modal = document.querySelector('#delete-modal');
        this.hideModal(modal);
    }

    /**
     * Visualisation des détails d'une tâche
     */
    viewTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Création d'un modal de visualisation personnalisé
        this.showTaskDetails(task);
    }

    /**
     * Marquage d'une tâche comme terminée
     */
    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.status = 'terminé';
        this.updateTaskInDOM(task);
        this.refreshStats();
        this.showNotification('Tâche marquée comme terminée!', 'success');

        // Effet visuel de célébration
        this.celebrateCompletion(task.element);
    }

    /**
     * Effet de célébration pour une tâche terminée
     */
    celebrateCompletion(element) {
        if (!element) return;

        element.classList.add('animate-pulse');
        element.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))';

        setTimeout(() => {
            element.classList.remove('animate-pulse');
            element.style.background = '';
        }, 2000);
    }

    /**
     * Affichage des détails d'une tâche
     */
    showTaskDetails(task) {
        const modal = this.createTaskDetailsModal(task);
        document.body.appendChild(modal);
        this.showModal(modal);

        // Suppression automatique du modal après fermeture
        modal.addEventListener('hidden', () => {
            modal.remove();
        });
    }

    /**
     * Création du modal de détails
     */
    createTaskDetailsModal(task) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-eye"></i> Détails de la Tâche</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="task-detail-grid">
                        <div class="detail-item">
                            <label>Titre :</label>
                            <span>${this.escapeHtml(task.title)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Description :</label>
                            <span>${this.escapeHtml(task.description) || 'Aucune description'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Date limite :</label>
                            <span class="${this.isTaskOverdue(task) ? 'text-danger' : ''}">${task.date}</span>
                        </div>
                        <div class="detail-item">
                            <label>Priorité :</label>
                            <span class="priority-badge priority-${task.priority}">${this.formatPriority(task.priority)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Statut :</label>
                            <span class="status-badge status-${task.status}">${this.formatStatus(task.status.replace('-', ' '))}</span>
                        </div>
                        <div class="detail-item">
                            <label>Projet :</label>
                            <span>${this.escapeHtml(task.project)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Assigné à :</label>
                            <span>${this.escapeHtml(task.assignee)}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Fermer</button>
                    <button class="btn btn-primary" onclick="taskManager.editTask('${task.id}'); this.closest('.modal').remove();">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Gestion de la recherche
     */
    handleSearch(query) {
        this.currentFilter.search = query.toLowerCase();
        this.applyFilters();
    }

    /**
     * Gestion du filtre de statut
     */
    handleStatusFilter(status) {
        this.currentFilter.status = status;
        this.applyFilters();
    }

    /**
     * Gestion du tri
     */
    handleSort(sortBy) {
        this.currentFilter.sort = sortBy;
        this.applyFilters();
    }

    /**
     * Application des filtres
     */
    applyFilters() {
        let filtered = [...this.tasks];

        // Filtre par recherche
        if (this.currentFilter.search) {
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(this.currentFilter.search) ||
                task.description.toLowerCase().includes(this.currentFilter.search) ||
                task.project.toLowerCase().includes(this.currentFilter.search) ||
                task.assignee.toLowerCase().includes(this.currentFilter.search)
            );
        }

        // Filtre par statut
        if (this.currentFilter.status) {
            filtered = filtered.filter(task =>
                task.status === this.currentFilter.status.toLowerCase().replace(' ', '-')
            );
        }

        // Tri
        if (this.currentFilter.sort) {
            filtered.sort((a, b) => {
                switch (this.currentFilter.sort) {
                    case 'date':
                        return new Date(a.date) - new Date(b.date);
                    case 'priorite':
                        const priorityOrder = { 'haute': 3, 'moyenne': 2, 'basse': 1 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                    case 'statut':
                        return a.status.localeCompare(b.status);
                    case 'titre':
                        return a.title.localeCompare(b.title);
                    default:
                        return 0;
                }
            });
        }

        this.filteredTasks = filtered;
        this.currentPage = 1;
        this.updateTableDisplay();
        this.updatePagination();
    }

    /**
     * Mise à jour de l'affichage du tableau
     */
    updateTableDisplay() {
        const allRows = document.querySelectorAll('.task-row');
        allRows.forEach(row => row.style.display = 'none');

        const startIndex = (this.currentPage - 1) * this.tasksPerPage;
        const endIndex = startIndex + this.tasksPerPage;
        const visibleTasks = this.filteredTasks.slice(startIndex, endIndex);

        visibleTasks.forEach(task => {
            if (task.element) {
                task.element.style.display = '';
            }
        });

        // Animation d'apparition
        setTimeout(() => {
            visibleTasks.forEach((task, index) => {
                if (task.element) {
                    task.element.style.animationDelay = `${index * 0.05}s`;
                    task.element.classList.add('animate-fade-in');
                }
            });
        }, 50);
    }

    /**
     * Calcul des tâches en retard
     */
    calculateOverdueTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueTasks = this.tasks.filter(task => {
            if (task.status === 'terminé') return false;
            const taskDate = new Date(task.date);
            return taskDate < today;
        });

        const overdueCount = document.querySelector('#overdue-count');
        if (overdueCount) {
            overdueCount.textContent = overdueTasks.length;

            // Animation de pulsation si des tâches sont en retard
            if (overdueTasks.length > 0) {
                overdueCount.parentElement.classList.add('animate-pulse');
            }
        }
    }

    /**
     * Rafraîchissement des statistiques
     */
    refreshStats() {
        this.calculateOverdueTasks();

        // Mise à jour des autres statistiques
        const totalTasks = document.querySelector('.stats-cards .stat-card:first-child h3');
        const inProgressTasks = document.querySelector('.stats-cards .stat-card:nth-child(2) h3');
        const completedTasks = document.querySelector('.stats-cards .stat-card:nth-child(3) h3');

        if (totalTasks) totalTasks.textContent = this.tasks.length;

        if (inProgressTasks) {
            const inProgress = this.tasks.filter(t => t.status === 'en-cours').length;
            inProgressTasks.textContent = inProgress;
        }

        if (completedTasks) {
            const completed = this.tasks.filter(t => t.status === 'terminé').length;
            completedTasks.textContent = completed;
        }
    }

    /**
     * Pagination - Page précédente
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateTableDisplay();
            this.updatePagination();
        }
    }

    /**
     * Pagination - Page suivante
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredTasks.length / this.tasksPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.updateTableDisplay();
            this.updatePagination();
        }
    }

    /**
     * Mise à jour des contrôles de pagination
     */
    updatePagination() {
        const totalPages = Math.ceil(this.filteredTasks.length / this.tasksPerPage);

        const currentPageEl = document.querySelector('#current-page');
        const totalPagesEl = document.querySelector('#total-pages');
        const prevBtn = document.querySelector('#prev-page');
        const nextBtn = document.querySelector('#next-page');

        if (currentPageEl) currentPageEl.textContent = this.currentPage;
        if (totalPagesEl) totalPagesEl.textContent = totalPages;

        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
    }

    /**
     * Exportation des tâches
     */
    exportTasks() {
        const exportBtn = document.querySelector('#export-btn');
        const originalText = exportBtn.innerHTML;

        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Export...';
        exportBtn.disabled = true;

        setTimeout(() => {
            const csvContent = this.generateCSV();
            this.downloadCSV(csvContent, 'taches_haute_matsiatra.csv');

            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;

            this.showNotification('Export réalisé avec succès!', 'success');
        }, 1000);
    }

    /**
     * Génération du CSV
     */
    generateCSV() {
        const headers = ['Titre', 'Description', 'Date limite', 'Priorité', 'Statut', 'Projet', 'Assigné à'];
        const rows = this.tasks.map(task => [
            task.title,
            task.description,
            task.date,
            this.formatPriority(task.priority),
            this.formatStatus(task.status.replace('-', ' ')),
            task.project,
            task.assignee
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
            .join('\n');

        return csvContent;
    }

    /**
     * Téléchargement du fichier CSV
     */
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    /**
     * Gestion de la déconnexion
     */
    handleLogout() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            // Animation de sortie
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';

            setTimeout(() => {
                window.location.href = '/logout';
            }, 500);
        }
    }

    /**
     * Gestion du redimensionnement
     */
    handleResize() {
        // Ajustement de la pagination mobile
        const pagination = document.querySelector('.pagination');
        if (pagination && window.innerWidth < 768) {
            pagination.classList.add('mobile');
        } else if (pagination) {
            pagination.classList.remove('mobile');
        }

        // Réajustement des tooltips
        this.repositionTooltips();
    }

    /**
     * Configuration des animations
     */
    setupAnimations() {
        // Intersection Observer pour les animations au défilement
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, observerOptions);

        // Observer les cartes statistiques
        document.querySelectorAll('.stat-card').forEach(card => {
            this.observer.observe(card);
        });
    }

    /**
     * Animation des éléments au chargement
     */
    animateElements() {
        const elements = [
            { selector: '.page-header', delay: 0 },
            { selector: '.stats-cards', delay: 200 },
            { selector: '.card', delay: 400 }
        ];

        elements.forEach(({ selector, delay }) => {
            setTimeout(() => {
                const element = document.querySelector(selector);
                if (element) {
                    element.classList.add('animate-fade-in');
                }
            }, delay);
        });
    }

    /**
     * Animation d'une nouvelle tâche
     */
    animateNewTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.element) {
            task.element.classList.add('animate-slide-in');
            task.element.style.background = 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.05))';

            setTimeout(() => {
                task.element.style.background = '';
            }, 2000);
        }
    }

    /**
     * Initialisation des tooltips
     */
    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[title]');
        tooltipElements.forEach(element => {
            this.createTooltip(element);
        });
    }

    /**
     * Création d'un tooltip personnalisé
     */
    createTooltip(element) {
        const title = element.getAttribute('title');
        if (!title) return;

        element.removeAttribute('title');

        let tooltip = null;

        element.addEventListener('mouseenter', (e) => {
            tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = title;
            document.body.appendChild(tooltip);

            this.positionTooltip(tooltip, e.target);
        });

        element.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        });

        element.addEventListener('mousemove', (e) => {
            if (tooltip) {
                this.positionTooltip(tooltip, e.target);
            }
        });
    }

    /**
     * Positionnement du tooltip
     */
    positionTooltip(tooltip, target) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top = rect.top - tooltipRect.height - 10;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

        // Ajustements pour éviter le débordement
        if (top < 0) {
            top = rect.bottom + 10;
        }

        if (left < 0) {
            left = 5;
        } else if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 5;
        }

        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left}px`;
    }

    /**
     * Repositionnement des tooltips
     */
    repositionTooltips() {
        const tooltips = document.querySelectorAll('.custom-tooltip');
        tooltips.forEach(tooltip => tooltip.remove());
    }

    /**
     * Affichage/masquage des modals avec animation
     */
    showModal(modal) {
        if (!modal) return;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus trap
        this.trapFocus(modal);
    }

    hideModal(modal) {
        if (!modal) return;

        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Événement personnalisé
        modal.dispatchEvent(new Event('hidden'));
    }

    /**
     * Fermeture de tous les modals
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => this.hideModal(modal));
    }

    /**
     * Piège de focus pour accessibilité
     */
    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }

    /**
     * Système de notifications
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icon}"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Conteneur de notifications
        let container = document.querySelector('.notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Fermeture automatique
        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);

        // Bouton de fermeture
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
    }

    /**
     * Masquage d'une notification
     */
    hideNotification(notification) {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Icône pour les notifications
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Utilitaires de formatage
     */
    formatPriority(priority) {
        const priorities = {
            'haute': 'Haute',
            'high': 'Haute',
            'moyenne': 'Moyenne',
            'medium': 'Moyenne',
            'basse': 'Basse',
            'low': 'Basse'
        };
        return priorities[priority] || 'Moyenne';
    }

    formatStatus(status) {
        const statuses = {
            'en cours': 'En cours',
            'en-cours': 'En cours',
            'planifié': 'Planifié',
            'planned': 'Planifié',
            'terminé': 'Terminé',
            'completed': 'Terminé',
            'en retard': 'En retard',
            'overdue': 'En retard'
        };
        return statuses[status] || status;
    }

    /**
     * Vérification si une tâche est en retard
     */
    isTaskOverdue(task) {
        if (task.status === 'terminé') return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(task.date);

        return taskDate < today;
    }

    /**
     * Échappement HTML pour sécurité
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    /**
     * Sauvegarde automatique dans le localStorage
     */
    autoSave() {
        try {
            const data = {
                tasks: this.tasks,
                filters: this.currentFilter,
                timestamp: Date.now()
            };
            localStorage.setItem('taskManager_data', JSON.stringify(data));
        } catch (e) {
            console.warn('Impossible de sauvegarder dans le localStorage:', e);
        }
    }

    /**
     * Restauration depuis le localStorage
     */
    restoreFromAutoSave() {
        try {
            const saved = localStorage.getItem('taskManager_data');
            if (saved) {
                const data = JSON.parse(saved);

                // Vérifier que les données ne sont pas trop anciennes (24h)
                if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    this.currentFilter = data.filters || this.currentFilter;

                    // Restaurer les filtres dans l'interface
                    this.restoreFilterUI();
                }
            }
        } catch (e) {
            console.warn('Impossible de restaurer depuis le localStorage:', e);
        }
    }

    /**
     * Restauration de l'interface des filtres
     */
    restoreFilterUI() {
        const searchInput = document.querySelector('#searchInput');
        const statusFilter = document.querySelector('#status-filter');
        const sortFilter = document.querySelector('#sort-filter');

        if (searchInput && this.currentFilter.search) {
            searchInput.value = this.currentFilter.search;
        }

        if (statusFilter && this.currentFilter.status) {
            statusFilter.value = this.currentFilter.status;
        }

        if (sortFilter && this.currentFilter.sort) {
            sortFilter.value = this.currentFilter.sort;
        }

        // Appliquer les filtres restaurés
        this.applyFilters();
    }

    /**
     * Gestion des erreurs globales
     */
    handleError(error, context = '') {
        console.error(`Erreur TaskManager ${context}:`, error);
        this.showNotification(
            `Une erreur s'est produite ${context}. Veuillez réessayer.`,
            'error'
        );
    }

    /**
     * Nettoyage et destruction
     */
    destroy() {
        // Nettoyage des événements
        if (this.observer) {
            this.observer.disconnect();
        }

        // Sauvegarde finale
        this.autoSave();

        // Nettoyage du DOM
        const tooltips = document.querySelectorAll('.custom-tooltip');
        tooltips.forEach(tooltip => tooltip.remove());

        const notifications = document.querySelector('.notifications-container');
        if (notifications) {
            notifications.remove();
        }
    }
}

// Styles CSS supplémentaires pour les fonctionnalités JavaScript
const additionalStyles = `
    /* Notifications */
    .notifications-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
    }

    .notification {
        background: var(--bg-primary);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        margin-bottom: var(--spacing-md);
        padding: var(--spacing-lg);
        border-left: 4px solid;
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 400px;
        pointer-events: auto;
        transform: translateX(100%);
        transition: all var(--transition-normal);
        opacity: 0;
    }

    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }

    .notification.hide {
        transform: translateX(100%);
        opacity: 0;
    }

    .notification-success {
        border-color: var(--success-color);
    }

    .notification-error {
        border-color: var(--danger-color);
    }

    .notification-warning {
        border-color: var(--warning-color);
    }

    .notification-info {
        border-color: var(--info-color);
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex: 1;
    }

    .notification-content i {
        font-size: 1.1rem;
    }

    .notification-success .notification-content i {
        color: var(--success-color);
    }

    .notification-error .notification-content i {
        color: var(--danger-color);
    }

    .notification-warning .notification-content i {
        color: var(--warning-color);
    }

    .notification-info .notification-content i {
        color: var(--info-color);
    }

    .notification-close {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }

    .notification-close:hover {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    /* Tooltips personnalisés */
    .custom-tooltip {
        position: absolute;
        background: var(--bg-dark);
        color: var(--text-light);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 10001;
        pointer-events: none;
        box-shadow: var(--shadow-lg);
        max-width: 200px;
        text-align: center;
        opacity: 0;
        animation: tooltipFadeIn 0.2s ease forwards;
    }

    .custom-tooltip::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: var(--bg-dark);
    }

    @keyframes tooltipFadeIn {
        to {
            opacity: 1;
        }
    }

    /* Détails de tâche */
    .task-detail-grid {
        display: grid;
        gap: var(--spacing-lg);
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .detail-item label {
        font-weight: 600;
        color: var(--text-secondary);
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.025em;
    }

    .detail-item span {
        color: var(--text-primary);
        font-size: 1rem;
    }

    .text-danger {
        color: var(--danger-color) !important;
        font-weight: 600;
    }

    /* Pagination mobile */
    .pagination.mobile {
        flex-wrap: wrap;
        gap: var(--spacing-sm);
    }

    .pagination.mobile .pagination-info {
        width: 100%;
        text-align: center;
        margin-bottom: var(--spacing-sm);
    }

    /* États de chargement */
    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
    }

    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(2px);
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--border-color);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Améliorations responsive */
    @media (max-width: 768px) {
        .notifications-container {
            top: 10px;
            right: 10px;
            left: 10px;
        }

        .notification {
            max-width: none;
        }

        .custom-tooltip {
            max-width: 150px;
            font-size: 0.75rem;
        }
    }
`;

// Injection des styles supplémentaires
function injectAdditionalStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = additionalStyles;
    document.head.appendChild(styleElement);
}

// Initialisation de l'application
let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    try {
        injectAdditionalStyles();
        taskManager = new TaskManager();

        // Sauvegarde périodique
        setInterval(() => {
            if (taskManager) {
                taskManager.autoSave();
            }
        }, 60000); // Toutes les minutes

        // Nettoyage avant fermeture
        window.addEventListener('beforeunload', () => {
            if (taskManager) {
                taskManager.destroy();
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);

        // Interface de fallback basique
        document.body.innerHTML += `
            <div class="error-fallback">
                <h2>Erreur de chargement</h2>
                <p>Une erreur s'est produite lors du chargement de l'application.</p>
                <button onclick="location.reload()">Recharger la page</button>
            </div>
        `;
    }
});

// Export pour utilisation externe si nécessaire
window.TaskManager = TaskManager;
