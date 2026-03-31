/**
 * Luxe Salon - JavaScript Functionality
 * Handles API integration, form validation, and UI interactions
 */

// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = 'https://luxe-salon-backend-qqs7.onrender.com';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Show notification message
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

/**
 * Show form message
 * @param {string} elementId - The form message element ID
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showFormMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.className = `form-message ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageEl.className = 'form-message';
    }, 5000);
}

/**
 * Format date for display
 * @param {string} dateString - Date string in format "YYYY-MM-DD HH:MM:SS"
 * @returns {string} Formatted date string
 */
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch services from the backend
 * @returns {Promise<Array>} Array of services
 */
async function fetchServices() {
    try {
        const response = await fetch(`${API_BASE_URL}/services`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const services = await response.json();
        return services;
    } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
    }
}

/**
 * Fetch all bookings from the backend
 * @returns {Promise<Array>} Array of bookings
 */
async function fetchBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const bookings = await response.json();
        return bookings;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
}

/**
 * Create a new booking
 * @param {Object} bookingData - The booking data
 * @returns {Promise<Object>} Response from the server
 */
async function createBooking(bookingData) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create booking');
        }
        
        return data;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}

/**
 * Delete a booking
 * @param {number} bookingId - The booking ID to delete
 * @returns {Promise<Object>} Response from the server
 */
async function deleteBooking(bookingId) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        // Check if response has content
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: 'Booking deleted successfully' };
        }
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete booking');
        }
        
        return data;
    } catch (error) {
        console.error('Error deleting booking:', error);
        throw error;
    }
}

// ============================================
// HOME PAGE FUNCTIONS
// ============================================

/**
 * Load and display services on the home page
 */
async function loadServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;
    
    try {
        const services = await fetchServices();
        
        if (services.length === 0) {
            servicesGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-spa"></i>
                    </div>
                    <h3>No Services Available</h3>
                    <p>Please check back later for our services.</p>
                </div>
            `;
            return;
        }
        
        // Service icons mapping
        const serviceIcons = {
            'Hair Styling': 'fa-cut',
            'Nail Care': 'fa-hand-sparkles',
            'Facial': 'fa-face-smile',
            'Massage': 'fa-spa',
            'Makeup': 'fa-paint-brush',
            'default': 'fa-star'
        };
        
        servicesGrid.innerHTML = services.map(service => {
            const icon = serviceIcons[service.name] || serviceIcons['default'];
            
            return `
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <h3>${service.name}</h3>
                    <div class="service-price">$${service.price.toFixed(2)}</div>
                    <div class="service-duration">
                        <i class="fas fa-clock"></i> ${service.duration} minutes
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        servicesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Unable to Load Services</h3>
                <p>Please ensure the backend server is running and try again.</p>
            </div>
        `;
    }
}

/**
 * Populate service dropdown in booking form
 */
async function populateServiceDropdown() {
    const serviceSelect = document.getElementById('serviceSelect');
    if (!serviceSelect) return;
    
    try {
        const services = await fetchServices();
        
        // Clear existing options except the first one
        serviceSelect.innerHTML = '<option value="">Choose a service...</option>';
        
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} - $${service.price.toFixed(2)} (${service.duration} min)`;
            serviceSelect.appendChild(option);
        });
        
    } catch (error) {
        serviceSelect.innerHTML = '<option value="">Unable to load services</option>';
        console.error('Error populating service dropdown:', error);
    }
}

/**
 * Handle booking form submission
 * @param {Event} event - The form submit event
 */
async function handleBookingSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.btn-submit');
    const originalBtnText = submitBtn.innerHTML;
    
    // Get form values
    const customerName = document.getElementById('customerName').value.trim();
    const serviceId = document.getElementById('serviceSelect').value;
    const bookingDate = document.getElementById('bookingDate').value;
    const bookingTime = document.getElementById('bookingTime').value;
    
    // Validation
    if (!customerName || !serviceId || !bookingDate || !bookingTime) {
        showFormMessage('formMessage', 'Please fill in all fields', 'error');
        return;
    }
    
    if (customerName.length < 2) {
        showFormMessage('formMessage', 'Please enter a valid name (at least 2 characters)', 'error');
        return;
    }
    
    // Format booking time as "YYYY-MM-DD HH:MM:SS"
    const bookingTimeFormatted = `${bookingDate} ${bookingTime}:00`;
    
    // Prepare booking data
    const bookingData = {
        service_id: parseInt(serviceId),
        customer_name: customerName,
        booking_time: bookingTimeFormatted
    };
    
    // Show loading state
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Booking...';
    submitBtn.disabled = true;
    
    try {
        const response = await createBooking(bookingData);
        
        showFormMessage('formMessage', 'Booking confirmed! We look forward to seeing you.', 'success');
        showNotification('Booking created successfully!', 'success');
        
        // Reset form
        form.reset();
        
    } catch (error) {
        showFormMessage('formMessage', error.message || 'Failed to create booking. Please try again.', 'error');
        showNotification('Failed to create booking', 'error');
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

/**
 * Set minimum date for booking date input
 */
function setMinBookingDate() {
    const bookingDate = document.getElementById('bookingDate');
    if (bookingDate) {
        bookingDate.min = getTodayDate();
    }
}

// ============================================
// ADMIN PAGE FUNCTIONS
// ============================================

/**
 * Load and display bookings on the admin page
 */
async function loadBookings() {
    const tableBody = document.getElementById('bookingsTableBody');
    const emptyState = document.getElementById('emptyState');
    const table = document.querySelector('.bookings-table');
    
    if (!tableBody) return;
    
    try {
        const bookings = await fetchBookings();
        const services = await fetchServices();
        
        // Create a map of service IDs to service names
        const serviceMap = {};
        services.forEach(service => {
            serviceMap[service.id] = service.name;
        });
        
        // Update stats
        updateStats(bookings, services);
        
        if (bookings.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        table.style.display = 'table';
        emptyState.style.display = 'none';
        
        // Sort bookings by booking time (most recent first)
        bookings.sort((a, b) => new Date(b.booking_time) - new Date(a.booking_time));
        
        tableBody.innerHTML = bookings.map(booking => {
            const serviceName = serviceMap[booking.service_id] || 'Unknown Service';
            
            return `
                <tr>
                    <td class="booking-id">#${booking.id}</td>
                    <td class="customer-name">${booking.customer_name}</td>
                    <td>
                        <span class="service-badge">${serviceName}</span>
                    </td>
                    <td class="booking-time">${formatDateTime(booking.booking_time)}</td>
                    <td>
                        <button class="btn-delete" onclick="handleDeleteBooking(${booking.id})">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Unable to Load Bookings</h3>
                    <p>Please ensure the backend server is running and try again.</p>
                </td>
            </tr>
        `;
        console.error('Error loading bookings:', error);
    }
}

/**
 * Update admin dashboard statistics
 * @param {Array} bookings - Array of bookings
 * @param {Array} services - Array of services
 */
function updateStats(bookings, services) {
    // Total bookings
    const totalBookingsEl = document.getElementById('totalBookings');
    if (totalBookingsEl) {
        totalBookingsEl.textContent = bookings.length;
    }
    
    // Total unique customers
    const uniqueCustomers = new Set(bookings.map(b => b.customer_name));
    const totalCustomersEl = document.getElementById('totalCustomers');
    if (totalCustomersEl) {
        totalCustomersEl.textContent = uniqueCustomers.size;
    }
    
    // Total services
    const totalServicesEl = document.getElementById('totalServices');
    if (totalServicesEl) {
        totalServicesEl.textContent = services.length;
    }
    
    // Today's bookings
    const today = getTodayDate();
    const todayBookings = bookings.filter(b => b.booking_time.startsWith(today));
    const todayBookingsEl = document.getElementById('todayBookings');
    if (todayBookingsEl) {
        todayBookingsEl.textContent = todayBookings.length;
    }
}

/**
 * Handle booking deletion
 * @param {number} bookingId - The booking ID to delete
 */
async function handleDeleteBooking(bookingId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        return;
    }
    
    try {
        await deleteBooking(bookingId);
        showNotification('Booking deleted successfully!', 'success');
        
        // Reload bookings
        await loadBookings();
        
    } catch (error) {
        showNotification(error.message || 'Failed to delete booking', 'error');
    }
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

/**
 * Handle mobile menu toggle
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Animate hamburger icon
            const spans = mobileMenuBtn.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('active'));
        });
        
        // Close menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
}

/**
 * Handle navbar scroll effect
 */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize home page
 */
function initHomePage() {
    // Check if we're on the home page
    if (!document.getElementById('servicesGrid')) return;
    
    console.log('Initializing Home Page...');
    
    // Load services
    loadServices();
    
    // Populate service dropdown
    populateServiceDropdown();
    
    // Set minimum booking date
    setMinBookingDate();
    
    // Initialize booking form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
}

/**
 * Initialize admin page
 */
function initAdminPage() {
    // Check if we're on the admin page
    if (!document.getElementById('bookingsTableBody')) return;
    
    console.log('Initializing Admin Page...');
    
    // Load bookings
    loadBookings();
    
    // Initialize refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.innerHTML = '<span class="loading-spinner"></span> Refreshing...';
            refreshBtn.disabled = true;
            
            loadBookings().finally(() => {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                refreshBtn.disabled = false;
            });
        });
    }
}

/**
 * Main initialization function
 */
function init() {
    console.log('Luxe Salon - Initializing...');
    
    // Initialize common elements
    initMobileMenu();
    initNavbarScroll();
    initSmoothScroll();
    
    // Initialize page-specific functionality
    initHomePage();
    initAdminPage();
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Make handleDeleteBooking available globally for onclick handlers
window.handleDeleteBooking = handleDeleteBooking;
