document.addEventListener('DOMContentLoaded', function() {
    // Initialize the tab system
    initTabs();
    
    // Initialize all components
    initProblemGenerator();
    initComplexityVisualizer();
    initLeaderboard();
    initDebugHelper();
});


// Initialize the tab navigation system

function initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and tab contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Save the active tab to localStorage
            localStorage.setItem('activeTab', tabId);
        });
    });
    
    // Restore active tab from localStorage if available
    const activeTab = localStorage.getItem('activeTab');
    if (activeTab) {
        const tabToActivate = document.querySelector(`.nav-tab[data-tab="${activeTab}"]`);
        if (tabToActivate) {
            tabToActivate.click();
        }
    }
}


function showNotification(message, type = 'info', duration = 3000) {
    // Check if notification container exists, if not create it
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Style the notification container
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1000';
        notificationContainer.style.display = 'flex';
        notificationContainer.style.flexDirection = 'column';
        notificationContainer.style.gap = '10px';
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        </div>
        <div class="notification-content">${message}</div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Style the notification
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.padding = '12px 15px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    notification.style.animation = 'slideUp 0.3s ease forwards';
    notification.style.backgroundColor = 'white';
    notification.style.borderLeft = `4px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#4a6bff'}`;
    notification.style.minWidth = '250px';
    notification.style.maxWidth = '400px';
    
    // Style notification elements
    const notificationIcon = notification.querySelector('.notification-icon');
    notificationIcon.style.marginRight = '10px';
    notificationIcon.style.color = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#4a6bff';
    
    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.flex = '1';
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#6c757d';
    
    // Add the notification to the container
    notificationContainer.appendChild(notification);
    
    // Add click event for close button
    closeBtn.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Automatically remove the notification after duration
    setTimeout(() => {
        // Check if notification still exists
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(20px)';
            notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, duration);
}
