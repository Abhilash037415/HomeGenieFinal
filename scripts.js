// Initialize Vanta.js background
let vantaEffect;
function initVanta() {
    if (document.getElementById('vanta-bg')) {
        vantaEffect = VANTA.NET({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x4361ee,
            backgroundColor: 0xf8f9fa,
            points: 10.00,
            maxDistance: 22.00,
            spacing: 18.00
        });
    }
}

// Toggle sidebar
function setupSidebar() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (menuToggle && sidebar && sidebarOverlay) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
            
            // Prevent scrolling when sidebar is open
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        });

        // Close sidebar when clicking on overlay
        sidebarOverlay.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            sidebar.classList.remove('active');
            this.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close sidebar when clicking anywhere outside
        document.addEventListener('click', function(e) {
            if (!sidebar.contains(e.target) && e.target !== menuToggle) {
                menuToggle.classList.remove('active');
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close sidebar when clicking a link (mobile)
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 992) {
                    menuToggle.classList.remove('active');
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }
}

// Dark mode toggle
function setupDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            document.body.classList.toggle('dark-mode', this.checked);
            localStorage.setItem('darkMode', this.checked ? 'enabled' : 'disabled');
            
            if (typeof vantaEffect !== 'undefined') {
                vantaEffect.setOptions({
                    backgroundColor: this.checked ? 0x121212 : 0xf8f9fa,
                    color: this.checked ? 0x3f37c9 : 0x4361ee
                });
            }
            
            showToast(`Dark mode ${this.checked ? 'enabled' : 'disabled'}`);
        });
        
        // Check for saved preference
        if (localStorage.getItem('darkMode') === 'enabled') {
            darkModeToggle.checked = true;
            document.body.classList.add('dark-mode');
            if (typeof vantaEffect !== 'undefined') {
                vantaEffect.setOptions({
                    backgroundColor: 0x121212,
                    color: 0x3f37c9
                });
            }
        }
    }
}

// Set active sidebar link based on current page
function setActiveSidebarLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Profile edit functionality
function setupProfileEdit() {
    function setupEditSaveCancel(editBtnId, saveBtnId, cancelBtnId, cardSelector) {
        const editBtn = document.getElementById(editBtnId);
        const saveBtn = document.getElementById(saveBtnId);
        const cancelBtn = document.getElementById(cancelBtnId);
        const card = document.querySelector(cardSelector);
        
        if (!editBtn || !saveBtn || !cancelBtn || !card) return;
        
        editBtn.addEventListener('click', function() {
            const inputs = card.querySelectorAll('input, select');
            const paragraphs = card.querySelectorAll('p');
            
            paragraphs.forEach(p => p.style.display = 'none');
            inputs.forEach(input => {
                input.style.display = 'block';
                if (input.type === 'password') input.value = '';
            });
            
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
        });
        
        saveBtn.addEventListener('click', function() {
            const inputs = card.querySelectorAll('input, select');
            const paragraphs = card.querySelectorAll('p');
            
            inputs.forEach((input, index) => {
                if (input.type !== 'password' || input.value) {
                    paragraphs[index].textContent = input.value || paragraphs[index].textContent;
                }
            });
            
            inputs.forEach(input => input.style.display = 'none');
            paragraphs.forEach(p => p.style.display = 'block');
            
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            
            showToast('Changes saved successfully!');
        });
        
        cancelBtn.addEventListener('click', function() {
            const inputs = card.querySelectorAll('input, select');
            const paragraphs = card.querySelectorAll('p');
            
            inputs.forEach(input => input.style.display = 'none');
            paragraphs.forEach(p => p.style.display = 'block');
            
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
        });
    }

    // Initialize profile sections
    setupEditSaveCancel('edit-personal-btn', 'save-personal-btn', 'cancel-personal-btn', '#profile-section .detail-card:nth-child(1)');
    setupEditSaveCancel('edit-address-btn', 'save-address-btn', 'cancel-address-btn', '#profile-section .detail-card:nth-child(2)');
    setupEditSaveCancel('edit-security-btn', 'save-security-btn', 'cancel-security-btn', '#profile-section .detail-card:nth-child(3)');
    setupEditSaveCancel('edit-payment-btn', 'save-payment-btn', 'cancel-payment-btn', '#profile-section .detail-card:nth-child(4)');
}

// Booking management
function setupBookings() {
    document.querySelectorAll('.cancel-booking').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const bookingItem = this.closest('.booking-item');
            sessionStorage.setItem('cancellingBooking', bookingItem.querySelector('h3').textContent);
            document.getElementById('cancel-booking-modal').style.display = 'flex';
        });
    });

    const confirmCancelBooking = document.getElementById('confirm-cancel-booking');
    if (confirmCancelBooking) {
        confirmCancelBooking.addEventListener('click', function() {
            const bookingTitle = sessionStorage.getItem('cancellingBooking');
            if (bookingTitle) {
                showToast(`Booking for "${bookingTitle}" cancelled successfully!`);
                document.querySelectorAll('.booking-item').forEach(item => {
                    if (item.querySelector('h3').textContent === bookingTitle) {
                        item.remove();
                    }
                });
                sessionStorage.removeItem('cancellingBooking');
            }
            document.getElementById('cancel-booking-modal').style.display = 'none';
        });
    }

    const cancelCancelBooking = document.getElementById('cancel-cancel-booking');
    if (cancelCancelBooking) {
        cancelCancelBooking.addEventListener('click', function() {
            sessionStorage.removeItem('cancellingBooking');
            document.getElementById('cancel-booking-modal').style.display = 'none';
        });
    }

    // Other booking actions
    document.querySelectorAll('.modify-booking').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const bookingTitle = this.closest('.booking-item').querySelector('h3').textContent;
            showToast(`Redirecting to modify booking: ${bookingTitle}`);
        });
    });

    document.querySelectorAll('.rebook-service').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceName = this.closest('.booking-item').querySelector('h3').textContent;
            showToast(`Redirecting to rebook service: ${serviceName}`);
        });
    });

    document.querySelectorAll('.view-receipt').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceName = this.closest('.booking-item').querySelector('h3').textContent;
            showToast(`Opening receipt for: ${serviceName}`);
        });
    });
}

// Notifications
function setupNotifications() {
    const markAllRead = document.getElementById('mark-all-read');
    if (markAllRead) {
        markAllRead.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.notification-item.unread').forEach(item => {
                item.classList.remove('unread');
            });
            showToast('All notifications marked as read');
        });
    }

    document.querySelectorAll('.notification-actions a').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            this.closest('.notification-item').remove();
            showToast('Notification deleted');
        });
    });
}

// Payment methods
function setupPayments() {
    const addPaymentMethod = document.getElementById('add-payment-method');
    if (addPaymentMethod) {
        addPaymentMethod.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('add-payment-modal').style.display = 'flex';
        });
    }

    const cancelAddPayment = document.getElementById('cancel-add-payment');
    if (cancelAddPayment) {
        cancelAddPayment.addEventListener('click', function() {
            document.getElementById('add-payment-modal').style.display = 'none';
        });
    }

    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const cardNumber = this.querySelector('input[type="text"]').value;
            const lastFour = cardNumber.slice(-4);
            
            const paymentMethodsContainer = document.querySelector('#payments-section .card:first-child');
            const newPaymentMethod = document.createElement('div');
            newPaymentMethod.className = 'payment-method';
            newPaymentMethod.innerHTML = `
                <div class="payment-icon">
                    <i class="fab fa-cc-visa"></i>
                </div>
                <div class="payment-info">
                    <h4>VISA ending in ${lastFour}</h4>
                    <p>Added just now</p>
                </div>
                <div class="payment-actions">
                    <a href="#"><i class="fas fa-edit"></i></a>
                    <a href="#"><i class="fas fa-trash"></i></a>
                </div>
            `;
            
            newPaymentMethod.querySelector('.fa-trash').closest('a').addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to remove this payment method?')) {
                    newPaymentMethod.remove();
                    showToast('Payment method removed');
                }
            });
            
            paymentMethodsContainer.appendChild(newPaymentMethod);
            document.getElementById('add-payment-modal').style.display = 'none';
            this.reset();
            showToast('Payment method added successfully!');
        });
    }

    document.querySelectorAll('.payment-actions .fa-trash').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to remove this payment method?')) {
                this.closest('.payment-method').remove();
                showToast('Payment method removed');
            }
        });
    });
}

// Referral code
function setupReferral() {
    const referralCopyBtn = document.querySelector('.referral-code button');
    if (referralCopyBtn) {
        referralCopyBtn.addEventListener('click', function() {
            const code = document.querySelector('.referral-code span').textContent;
            navigator.clipboard.writeText(code).then(() => {
                const originalText = this.textContent;
                this.textContent = 'COPIED!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
                showToast('Referral code copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                showToast('Failed to copy referral code', 'error');
            });
        });
    }
}

// Logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('logout-modal').style.display = 'flex';
        });
    }

    const cancelLogout = document.getElementById('cancel-logout');
    if (cancelLogout) {
        cancelLogout.addEventListener('click', function() {
            document.getElementById('logout-modal').style.display = 'none';
        });
    }

    const confirmLogout = document.getElementById('confirm-logout');
    if (confirmLogout) {
        confirmLogout.addEventListener('click', function() {
            showToast('Logging out...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
}

// Avatar upload
function setupAvatarUpload() {
    const avatarUpload = document.querySelector('.profile-avatar-upload');
    if (avatarUpload) {
        avatarUpload.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = e => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                        showToast('Image size should be less than 2MB', 'error');
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = event => {
                        const img = document.createElement('img');
                        img.src = event.target.result;
                        document.querySelector('.profile-avatar').innerHTML = '';
                        document.querySelector('.profile-avatar').appendChild(img);
                        document.querySelector('.profile-avatar').appendChild(this);
                        showToast('Profile picture updated');
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });
    }
}

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize tooltips
function initTooltips() {
    const elementsWithTooltips = document.querySelectorAll('[data-tooltip]');
    
    elementsWithTooltips.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        
        element.appendChild(tooltip);
        
        element.addEventListener('mouseenter', () => {
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '0';
        });
    });
}

// Search functionality
function setupSearch() {
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        searchBar.addEventListener('submit', function(e) {
            e.preventDefault();
            const serviceInput = this.querySelector('input[type="text"]');
            const locationInput = this.querySelectorAll('input[type="text"]')[1];
            
            if (serviceInput.value.trim() && locationInput.value.trim()) {
                showToast(`Searching for ${serviceInput.value} in ${locationInput.value}`);
            } else {
                showToast('Please enter both service and location', 'error');
            }
        });
        
        searchBar.querySelector('button').addEventListener('click', function() {
            searchBar.dispatchEvent(new Event('submit'));
        });
        
        searchBar.querySelectorAll('input').forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchBar.dispatchEvent(new Event('submit'));
                }
            });
        });
    }
}

// Simulate loading data
function simulateDataLoading() {
    setTimeout(() => {
        const availabilityCards = document.querySelectorAll('.availability-card');
        if (availabilityCards.length > 0) {
            availabilityCards[0].querySelector('p').textContent = '15 minutes from now - John D. (4.9 ★)';
            availabilityCards[1].querySelector('p').textContent = '45 minutes from now - Sarah M. (4.8 ★)';
        }
        
        const unreadNotifications = document.querySelectorAll('.notification-item.unread').length;
        if (unreadNotifications > 0) {
            const bellIcon = document.querySelector('.sidebar-nav a[href="notifications.html"] i');
            if (bellIcon) {
                const notificationBadge = document.createElement('span');
                notificationBadge.className = 'notification-badge';
                notificationBadge.textContent = unreadNotifications;
                bellIcon.parentNode.appendChild(notificationBadge);
            }
        }
    }, 1000);
}

// Close modals when clicking outside
function setupModalClose() {
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    initVanta();
    setupSidebar();
    setupDarkMode();
    setActiveSidebarLink();
    setupProfileEdit();
    setupBookings();
    setupNotifications();
    setupPayments();
    setupReferral();
    setupLogout();
    setupAvatarUpload();
    initTooltips();
    setupSearch();
    simulateDataLoading();
    setupModalClose();
    
    // Update Vanta.js on resize
    window.addEventListener('resize', function() {
        if (typeof vantaEffect !== 'undefined') {
            vantaEffect.resize();
        }
    });
});