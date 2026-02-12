/* app.js - The Intelligence Layer */

// 1. THEME MANAGEMENT (Dark/Light Logic)
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

// Check LocalStorage for persistence
if (localStorage.getItem('theme') === 'dark') {
    enableDarkMode();
}

themeToggle.addEventListener('click', () => {
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    if (isDark) {
        enableLightMode();
    } else {
        enableDarkMode();
    }
});

function enableDarkMode() {
    htmlEl.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    themeToggle.innerHTML = '<span class="icon">☀️</span> Day Mode';
}

function enableLightMode() {
    htmlEl.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    themeToggle.innerHTML = '<span class="icon">🌙</span> Night Shift';
}

// 2. PREDICTIVE INVENTORY ALGORITHM (Simulated)
// In production, this would query a real inventory API.
const marketData = [
    { item: "Parabolic Springs", trend: "High demand", stock: 12 },
    { item: "Multi-leaf Springs", trend: "Steady orders", stock: 28 },
    { item: "Extrusion Products", trend: "Bulk inquiry from NCR", stock: 45 },
    { item: "Air Suspension", trend: "New inquiries", stock: 8 },
    { item: "Bogie Suspension", trend: "Railway contract pending", stock: 15 }
];

function updatePulse() {
    const pulseText = document.getElementById('pulse-text');
    const randomInsight = marketData[Math.floor(Math.random() * marketData.length)];
    
    // Fade out
    pulseText.style.opacity = 0;
    
    setTimeout(() => {
        // Logic: If stock is low, warn the user.
        let msg = `${randomInsight.trend} for ${randomInsight.item}.`;
        
        if (randomInsight.stock < 15) {
            msg += ` <span style="color: #e17055; font-weight:bold;">⚠️ Only ${randomInsight.stock} units left!</span>`;
        } else {
            msg += ` ✅ Ready to ship from Baraut.`;
        }
        
        pulseText.innerHTML = msg;
        pulseText.style.opacity = 1;
    }, 500);
}

// Update the ticker every 6 seconds
setInterval(updatePulse, 6000);
// Initial update
updatePulse();

// 3. AI CHATBOT LOGIC (NLP Lite)
const chatBody = document.getElementById('chat-body');
const chatInputArea = document.getElementById('chat-input-area');
const chatInput = document.getElementById('user-input');

function toggleChat() {
    const isHidden = chatBody.style.display === 'none';
    chatBody.style.display = isHidden ? 'block' : 'none';
    chatInputArea.style.display = isHidden ? 'flex' : 'none';
    
    if (isHidden) {
        chatInput.focus();
    }
}

function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    // Add User Message
    addMessage(text, 'user');
    chatInput.value = '';
    
    // Simulate AI Processing Delay
    setTimeout(() => {
        const response = generateResponse(text);
        addMessage(response, 'bot');
    }, 800);
}

function addMessage(text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${type}`;
    msgDiv.innerHTML = text;
    
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Simple Keyword Matching Logic
function generateResponse(input) {
    const lower = input.toLowerCase();
    
    if (lower.includes('price') || lower.includes('quote') || lower.includes('cost')) {
        return "I can generate a provisional invoice. Please specify the <strong>Product Model</strong> and <strong>Quantity</strong>. Our pricing is competitive and includes quality certifications.";
    }
    if (lower.includes('lead time') || lower.includes('how long') || lower.includes('delivery')) {
        return "Current production lead time for springs is <strong>3-4 days</strong>. Extrusion products are available for same-day dispatch from our Baraut facility.";
    }
    if (lower.includes('location') || lower.includes('address') || lower.includes('where')) {
        return "We are located at <strong>Delhi Saharanpur Road, Near Pashu Peeth, Baraut, UP 250611</strong>. We serve clients across NCR and pan-India. Would you like directions?";
    }
    if (lower.includes('grade') || lower.includes('steel') || lower.includes('material')) {
        return "We primarily use <strong>SUP-9, SUP-11, and EN-45</strong> grades sourced directly from Tata Steel. All materials come with mill test certificates and quality assurance.";
    }
    if (lower.includes('parabolic') || lower.includes('spring')) {
        return "Our Parabolic Springs feature variable thickness leaves for superior load distribution. Load capacity up to <strong>12 tons</strong> with 200k+ cycle life. Would you like technical specifications?";
    }
    if (lower.includes('extrusion') || lower.includes('plastic') || lower.includes('copper')) {
        return "We manufacture high-precision extrusion products in PVC and Copper alloys with tolerances of <strong>± 0.05mm</strong>. What application are you considering?";
    }
    if (lower.includes('quality') || lower.includes('certification') || lower.includes('iso')) {
        return "All our products are ISO certified with complete traceability. We provide mill test certificates, load test reports, and blockchain-verified provenance for every batch.";
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        return "Hello! 👋 Welcome to Shivam Automobile. How can I assist you with your suspension component needs today?";
    }
    if (lower.includes('thank') || lower.includes('thanks')) {
        return "You're welcome! Feel free to reach out anytime. We're here to help with your automotive component requirements. 😊";
    }
    
    return "I'll need to connect you with a senior engineer for that specific query. Shall I arrange a callback? You can also reach us at <strong>+91-1234567890</strong> or <strong>info@shivamautomobile.in</strong>";
}

// Bind Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// 4. SMOOTH SCROLL TO PRODUCTS
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// 5. ANIMATION OBSERVER (Scroll Reveals)
// Check if anime.js is loaded
if (typeof anime !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    translateY: [50, 0],
                    opacity: [0, 1],
                    duration: 800,
                    easing: 'easeOutExpo'
                });
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all cards
    document.querySelectorAll('.neu-card').forEach(card => observer.observe(card));
}

// 6. PRODUCT CARD INTERACTIONS
document.querySelectorAll('.product-card .neu-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const productName = this.closest('.product-card').querySelector('h3').textContent;
        
        // Open chatbot with pre-filled message
        chatBody.style.display = 'block';
        chatInputArea.style.display = 'flex';
        chatInput.value = `I'm interested in ${productName}. Can you provide pricing and lead time?`;
        chatInput.focus();
        
        // Scroll chatbot into view
        document.getElementById('chatbot').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
});

// 7. INITIALIZE ON LOAD
window.addEventListener('load', () => {
    // Add fade-in animation to hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('fade-in-up');
    }
    
    console.log('🚀 Shivam Automobile - Industrial Neumorphism System Loaded');
    console.log('💡 Theme:', htmlEl.getAttribute('data-theme'));
});

// 8. ACCESSIBILITY - Skip to main content
document.addEventListener('keydown', (e) => {
    // Alt + S to skip to products
    if (e.altKey && e.key === 's') {
        scrollToProducts();
    }
});
