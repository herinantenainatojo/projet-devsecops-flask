// static/js/notifications.js
document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    const notificationBadge = document.querySelector('.notification-badge');
    const notificationList = document.querySelector('.notification-list');
    const markAllReadBtn = document.querySelector('.mark-all-read');
    const viewAllBtn = document.querySelector('.view-all-notifications');

    // Données de démonstration (à remplacer par un appel API en production)
    let notifications = [
        {
            id: 1,
            read: false,
            type: 'success',
            icon: 'fa-check-circle',
            title: 'Projet approuvé',
            content: 'Le projet "Construction École Primaire Ambalavao" a été approuvé par la commission',
            time: 'Il y a 2 heures',
            link: '/projets/construction-ecole-ambalavao'
        },
        {
            id: 2,
            read: false,
            type: 'warning',
            icon: 'fa-exclamation-triangle',
            title: 'Retard signalé',
            content: 'Le projet "Route Rurale Ambositra" accuse 15 jours de retard',
            time: 'Il y a 5 heures',
            link: '/projets/route-rurale-ambositra'
        },
        {
            id: 3,
            read: true,
            type: 'info',
            icon: 'fa-file-alt',
            title: 'Document validé',
            content: 'Le rapport financier Q3 2023 a été validé par la direction',
            time: 'Hier',
            link: '/documents/rapport-financier-q3'
        }
    ];

    // Initialisation
    renderNotifications();
    updateBadge();

    // Gestion du clic sur le bouton de notification
    notificationBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleNotificationDropdown();
    });

    // Fermeture en cliquant à l'extérieur
    document.addEventListener('click', function() {
        notificationDropdown.classList.remove('active');
    });

    // Marquer toutes comme lues
    markAllReadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        markAllAsRead();
    });

    // Voir toutes les notifications
    viewAllBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/notifications';
    });

    // Fonctions principales
    function toggleNotificationDropdown() {
        notificationDropdown.classList.toggle('active');
        if (notificationDropdown.classList.contains('active')) {
            markAllAsRead();
        }
    }

    function renderNotifications() {
        notificationList.innerHTML = '';

        // Affiche les 5 dernières notifications
        notifications.slice(0, 5).forEach(notif => {
            const notifElement = document.createElement('a');
            notifElement.href = notif.link;
            notifElement.className = `notification-item ${notif.read ? '' : 'unread'}`;
            notifElement.innerHTML = `
                <div class="notification-icon ${notif.type}">
                    <i class="fas ${notif.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-text">${notif.content}</div>
                    <div class="notification-time">${notif.time}</div>
                </div>
            `;

            notifElement.addEventListener('click', () => markAsRead(notif.id));
            notificationList.appendChild(notifElement);
        });
    }

    function markAsRead(id) {
        notifications = notifications.map(notif =>
            notif.id === id ? {...notif, read: true} : notif
        );
        updateBadge();
    }

    function markAllAsRead() {
        notifications = notifications.map(notif => ({...notif, read: true}));
        updateBadge();
        renderNotifications();
    }

    function updateBadge() {
        const unreadCount = notifications.filter(n => !n.read).length;
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';

        // Animation du badge
        if (unreadCount > 0) {
            notificationBadge.classList.add('pulse');
            setTimeout(() => {
                notificationBadge.classList.remove('pulse');
            }, 500);
        }
    }

    // Simulation de nouvelles notifications (à remplacer par WebSocket en production)
    function simulateNewNotification() {
        const projectNames = [
            'Centre de Santé Fianarantsoa',
            'Adduction d\'eau Ikalamavony',
            'Marché Ambositra',
            'Route RN7'
        ];

        const newNotif = {
            id: Date.now(),
            read: false,
            type: ['success', 'warning', 'info'][Math.floor(Math.random() * 3)],
            icon: ['fa-check-circle', 'fa-exclamation-triangle', 'fa-file-alt'][Math.floor(Math.random() * 3)],
            title: ['Nouvelle approbation', 'Alerte projet', 'Document disponible'][Math.floor(Math.random() * 3)],
            content: `Mise à jour pour le projet "${projectNames[Math.floor(Math.random() * projectNames.length)]}"`,
            time: 'À l\'instant',
            link: '#'
        };

        notifications.unshift(newNotif);
        renderNotifications();
        updateBadge();
    }

    // Simulation (à désactiver en production)
    const simulationInterval = setInterval(simulateNewNotification, 15000);

    // Nettoyage
    window.addEventListener('beforeunload', () => {
        clearInterval(simulationInterval);
    });
});
