// Chatbot state
let chatbotOpen = false;
let conversationHistory = [];

// AI responses database
const responses = {
    greetings: [
        "Hi there! 👋 How can I help you find the perfect outfit today?",
        "Hello! Welcome to KidLet Wear! What are you looking for?",
        "Hey! Ready to upgrade your wardrobe? Let me help!"
    ],
    products: {
        casual: "Our casual collection is perfect for everyday comfort! Check out our trendy graphic tees, hoodies, and joggers. Prices start from ₹599. Want to see them?",
        trendy: "Looking for the latest trends? We have amazing denim jackets, cargo pants, and street-style pieces that are super popular right now! 🔥",
        ethnic: "Our ethnic collection features beautiful kurta sets, lehengas, and sherwanis perfect for festivals and family functions. Traditional with a modern twist! ✨",
        party: "Get party-ready with our sparkly dresses, sequin tops, and glamorous jumpsuits! You'll definitely stand out! 🎉"
    },
    size: "Our size guide:\n• S: Chest 32-34\", Waist 26-28\"\n• M: Chest 36-38\", Waist 30-32\"\n• L: Chest 40-42\", Waist 34-36\"\n• XL: Chest 44-46\", Waist 38-40\"\n\nNeed help choosing the right size?",
    delivery: "We deliver within 200km of Delhi! 🚚\n• Standard delivery: 3-5 days (FREE)\n• Express delivery: 1-2 days (₹99)\n• Same day delivery available in select areas!\n\nWhere are you located?",
    payment: "We accept multiple payment methods:\n💳 Credit/Debit Cards\n📱 UPI (Google Pay, PhonePe, Paytm)\n💵 Cash on Delivery\n🏦 Net Banking\n\nAll payments are 100% secure!",
    returns: "Easy returns within 7 days! 🔄\n• No questions asked\n• Free pickup\n• Instant refund\n\nYour satisfaction is our priority!",
    help: "I can help you with:\n• Finding the perfect outfit\n• Size recommendations\n• Delivery information\n• Payment options\n• Order tracking\n• Returns & exchanges\n\nWhat would you like to know?",
    thanks: [
        "You're welcome! Happy shopping! 🛍️",
        "Anytime! Let me know if you need anything else!",
        "Glad I could help! Enjoy your shopping! ❤️"
    ]
};

// Initialize chatbot
function initChatbot() {
    setupChatbotListeners();
}

// Setup chatbot listeners
function setupChatbotListeners() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotForm = document.getElementById('chatbotForm');
    const chatbotInput = document.getElementById('chatbotInput');

    // Toggle chatbot
    chatbotToggle.addEventListener('click', () => {
        chatbotOpen = !chatbotOpen;
        chatbotWindow.style.display = chatbotOpen ? 'flex' : 'none';

        // Toggle icons
        const chatIcon = chatbotToggle.querySelector('.chat-icon');
        const closeIcon = chatbotToggle.querySelector('.close-icon');
        chatIcon.style.display = chatbotOpen ? 'none' : 'block';
        closeIcon.style.display = chatbotOpen ? 'block' : 'none';

        if (chatbotOpen) {
            chatbotInput.focus();
        }
    });

    // Send message
    chatbotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatbotInput.value.trim();
        if (message) {
            sendMessage(message);
            chatbotInput.value = '';
        }
    });
}

// Send message
function sendMessage(message) {
    // Add user message
    addMessage(message, 'user');

    // Get bot response
    setTimeout(() => {
        const response = getBotResponse(message);
        addMessage(response, 'bot');
    }, 500);
}

// Add message to chat
function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    if (sender === 'bot') {
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Save to history
    conversationHistory.push({ text, sender, timestamp: Date.now() });
}

// Get bot response
function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Greetings
    if (lowerMessage.match(/\b(hi|hello|hey|hola)\b/)) {
        return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
    }

    // Thanks
    if (lowerMessage.match(/\b(thank|thanks|thx)\b/)) {
        return responses.thanks[Math.floor(Math.random() * responses.thanks.length)];
    }

    // Products
    if (lowerMessage.includes('casual')) {
        return responses.products.casual;
    }
    if (lowerMessage.includes('trendy') || lowerMessage.includes('trend')) {
        return responses.products.trendy;
    }
    if (lowerMessage.includes('ethnic') || lowerMessage.includes('traditional')) {
        return responses.products.ethnic;
    }
    if (lowerMessage.includes('party')) {
        return responses.products.party;
    }

    // Size
    if (lowerMessage.includes('size')) {
        return responses.size;
    }

    // Delivery
    if (lowerMessage.includes('deliver') || lowerMessage.includes('shipping')) {
        return responses.delivery;
    }

    // Payment
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
        return responses.payment;
    }

    // Returns
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
        return responses.returns;
    }

    // Help
    if (lowerMessage.includes('help')) {
        return responses.help;
    }

    // Find outfit
    if (lowerMessage.includes('outfit') || lowerMessage.includes('find')) {
        return "I'd love to help you find the perfect outfit! 🎨\n\nWhat's the occasion?\n• Casual hangout\n• School/College\n• Party/Celebration\n• Traditional event\n\nOr tell me your style vibe!";
    }

    // Track order
    if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
        return "To track your order, please provide your order number. You can find it in your confirmation email. 📦\n\nAlternatively, you can check your order status in the 'My Orders' section after logging in!";
    }

    // Price
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return "Our products range from ₹599 to ₹2999! 💰\n\n• Casual wear: ₹599 - ₹1299\n• Trendy pieces: ₹799 - ₹1799\n• Ethnic wear: ₹1299 - ₹2999\n• Party outfits: ₹1199 - ₹2599\n\nWe have amazing deals running right now!";
    }

    // Discount
    if (lowerMessage.includes('discount') || lowerMessage.includes('offer') || lowerMessage.includes('sale')) {
        return "Great news! 🎉\n\nCurrent offers:\n• Flat 30% off on casual wear\n• Buy 2 Get 1 FREE on selected items\n• First purchase? Use code KIDLET10 for 10% off!\n\nOffers valid till end of month!";
    }

    // Default response with suggestions
    return "I'm here to help! I can assist you with:\n\n• Finding the perfect outfit 👕\n• Size recommendations 📏\n• Delivery info 🚚\n• Payment options 💳\n• Tracking orders 📦\n• Returns & refunds 🔄\n\nWhat would you like to know?";
}

// Quick message
function sendQuickMessage(message) {
    const chatbotInput = document.getElementById('chatbotInput');
    chatbotInput.value = message;
    sendMessage(message);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initChatbot);
