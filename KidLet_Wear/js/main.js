// Main JavaScript

// Theme management
let currentTheme = localStorage.getItem('theme') || 'light';

function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (currentTheme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

// Navbar scroll effect
function initNavbar() {
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Search functionality
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');

    searchBtn.addEventListener('click', () => {
        const query = prompt('What are you looking for?');
        if (query) {
            // Filter products based on search
            const lowerQuery = query.toLowerCase();
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.category.toLowerCase().includes(lowerQuery)
            );

            if (filtered.length > 0) {
                showNotification(`Found ${filtered.length} products!`);
                // In a real app, you'd update the products grid with filtered results
                scrollToSection('shop');
            } else {
                showNotification('No products found. Try different keywords!');
            }
        }
    });
}

// Newsletter form
function initNewsletter() {
    const form = document.getElementById('newsletterForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;

        // Simulate newsletter signup
        showNotification('Thanks for subscribing! 📧');
        form.reset();

        // In production, send to backend
        console.log('Newsletter signup:', email);
    });
}

// Login button
function initLogin() {
    const loginBtn = document.getElementById('loginBtn');

    loginBtn.addEventListener('click', () => {
        // In production, open login modal
        alert('Login/Signup\n\nThis is a demo. In production, this would open a login modal with:\n\n✓ Email/Password login\n✓ Google OAuth\n✓ Password reset\n✓ New user registration\n\nFor now, you can browse as a guest!');
    });
}

// Intersection Observer for animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements
    const animateElements = document.querySelectorAll('.category-card, .product-card, .feature-card, .testimonial-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// Parallax effect for hero
function initParallax() {
    const hero = document.querySelector('.hero');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const parallaxSpeed = 0.5;

        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
    });
}

// Performance: Lazy load images
function initLazyLoad() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        return;
    }

    // Fallback for older browsers
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Add to home screen prompt (PWA)
function initPWA() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Show install button after 30 seconds
        setTimeout(() => {
            if (deferredPrompt) {
                const install = confirm('Install KidLet Wear app for a better shopping experience?');
                if (install) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the install prompt');
                        }
                        deferredPrompt = null;
                    });
                }
            }
        }, 30000);
    });
}

// Gamification: First visit badge
function initGamification() {
    const firstVisit = !localStorage.getItem('visited');

    if (firstVisit) {
        localStorage.setItem('visited', 'true');

        setTimeout(() => {
            showBadgeNotification('Welcome Badge Unlocked! 🎉', 'Thanks for visiting KidLet Wear! Use code KIDLET10 for 10% off your first order!');
        }, 3000);
    }

    // Check if user has made a purchase
    const hasPurchased = localStorage.getItem('hasPurchased');
    if (!hasPurchased) {
        // Show first purchase incentive
        setTimeout(() => {
            if (!localStorage.getItem('incentiveShown')) {
                showBadgeNotification('First Purchase Bonus! 💎', 'Get an exclusive badge + extra 5% off on your first order!');
                localStorage.setItem('incentiveShown', 'true');
            }
        }, 60000); // After 1 minute
    }
}

function showBadgeNotification(title, message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 350px;
        animation: slideIn 0.5s ease-out;
    `;
    notification.innerHTML = `
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">${title}</h4>
        <p style="margin: 0; opacity: 0.95;">${message}</p>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 8000);
}

// Analytics (placeholder)
function trackEvent(category, action, label) {
    console.log('Analytics:', { category, action, label });
    // In production, send to Google Analytics or similar
}

// Initialize everything
function init() {
    initTheme();
    initNavbar();
    initSearch();
    initNewsletter();
    initLogin();
    initAnimations();
    initParallax();
    initLazyLoad();
    initPWA();
    initGamification();

    // Setup theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);

    // Track page view
    trackEvent('Page', 'View', 'Home');

    console.log('%c🎉 Welcome to KidLet Wear!', 'color: #8B5CF6; font-size: 24px; font-weight: bold;');
    console.log('%cBuilt with ❤️ for the best shopping experience', 'color: #EC4899; font-size: 14px;');
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Service Worker registration (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // In production, register service worker
        // navigator.serviceWorker.register('/sw.js');
    });
}
