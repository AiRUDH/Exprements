// Sample product data
const products = [
    {
        id: 1,
        name: "Trendy Graphic Tee",
        category: "casual",
        price: 599,
        originalPrice: 899,
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&h=500&fit=crop",
        colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"],
        rating: 4.5,
        reviews: 128,
        badge: "New",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 2,
        name: "Cool Denim Jacket",
        category: "trendy",
        price: 1499,
        originalPrice: 2199,
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
        colors: ["#4A90E2", "#2C3E50"],
        rating: 4.8,
        reviews: 256,
        badge: "Trending",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 3,
        name: "Ethnic Kurta Set",
        category: "ethnic",
        price: 1299,
        originalPrice: 1899,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=500&fit=crop",
        colors: ["#E74C3C", "#F39C12", "#8E44AD"],
        rating: 4.7,
        reviews: 89,
        badge: "Sale",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 4,
        name: "Party Sequin Dress",
        category: "party",
        price: 1899,
        originalPrice: 2799,
        image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=500&h=500&fit=crop",
        colors: ["#E91E63", "#9C27B0", "#3F51B5"],
        rating: 4.9,
        reviews: 167,
        badge: "Hot",
        sizes: ["S", "M", "L"]
    },
    {
        id: 5,
        name: "Casual Hoodie",
        category: "casual",
        price: 899,
        originalPrice: 1299,
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop",
        colors: ["#34495E", "#95A5A6", "#E74C3C"],
        rating: 4.6,
        reviews: 203,
        badge: "Popular",
        sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
        id: 6,
        name: "Trendy Joggers",
        category: "trendy",
        price: 799,
        originalPrice: 1199,
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=500&fit=crop",
        colors: ["#2C3E50", "#7F8C8D", "#27AE60"],
        rating: 4.4,
        reviews: 145,
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 7,
        name: "Traditional Lehenga",
        category: "ethnic",
        price: 2499,
        originalPrice: 3999,
        image: "https://images.unsplash.com/photo-1583391733981-5ade4c8a6a91?w=500&h=500&fit=crop",
        colors: ["#E74C3C", "#F39C12", "#16A085"],
        rating: 4.9,
        reviews: 78,
        badge: "Premium",
        sizes: ["S", "M", "L"]
    },
    {
        id: 8,
        name: "Sparkle Party Top",
        category: "party",
        price: 1199,
        originalPrice: 1799,
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop",
        colors: ["#FFD700", "#C0C0C0", "#E91E63"],
        rating: 4.7,
        reviews: 134,
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 9,
        name: "Comfy Sweatshirt",
        category: "casual",
        price: 699,
        originalPrice: 999,
        image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&h=500&fit=crop",
        colors: ["#3498DB", "#E74C3C", "#F39C12"],
        rating: 4.5,
        reviews: 189,
        sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
        id: 10,
        name: "Street Style Cargo",
        category: "trendy",
        price: 1099,
        originalPrice: 1599,
        image: "https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=500&h=500&fit=crop",
        colors: ["#2C3E50", "#27AE60", "#95A5A6"],
        rating: 4.6,
        reviews: 167,
        badge: "New",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 11,
        name: "Festive Sherwani",
        category: "ethnic",
        price: 2999,
        originalPrice: 4499,
        image: "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=500&h=500&fit=crop",
        colors: ["#8E44AD", "#C0392B", "#F39C12"],
        rating: 4.8,
        reviews: 92,
        badge: "Premium",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 12,
        name: "Glam Party Jumpsuit",
        category: "party",
        price: 1799,
        originalPrice: 2599,
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop",
        colors: ["#000000", "#E91E63", "#9C27B0"],
        rating: 4.9,
        reviews: 211,
        badge: "Trending",
        sizes: ["S", "M", "L"]
    }
];

// State
let currentFilter = 'all';
let displayedProducts = 8;

// Initialize products
function initProducts() {
    renderProducts();
    setupFilters();
    setupLoadMore();
}

// Render products
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const filtered = currentFilter === 'all' 
        ? products 
        : products.filter(p => p.category === currentFilter);
    
    const toDisplay = filtered.slice(0, displayedProducts);
    
    grid.innerHTML = toDisplay.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <button class="product-wishlist" onclick="toggleWishlist(${product.id})" aria-label="Add to wishlist">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    <span class="stars">${'⭐'.repeat(Math.floor(product.rating))}</span>
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">₹${product.price}</span>
                    ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                </div>
                <div class="product-colors">
                    ${product.colors.map(color => `
                        <div class="color-swatch" style="background: ${color}"></div>
                    `).join('')}
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary add-to-cart-btn" onclick="addToCart(${product.id})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Show/hide load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (displayedProducts >= filtered.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }
}

// Setup filters
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            displayedProducts = 8;
            renderProducts();
        });
    });
}

// Setup load more
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', () => {
        displayedProducts += 4;
        renderProducts();
    });
}

// Filter products by category
function filterProducts(category) {
    currentFilter = category;
    displayedProducts = 8;
    
    // Update filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderProducts();
    
    // Scroll to products section
    document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
}

// Toggle wishlist
function toggleWishlist(productId) {
    const btn = event.currentTarget;
    btn.classList.toggle('active');
    
    // Get wishlist from localStorage
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (btn.classList.contains('active')) {
        wishlist.push(productId);
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
        showNotification('Added to wishlist! ❤️');
    } else {
        wishlist = wishlist.filter(id => id !== productId);
        btn.querySelector('svg').setAttribute('fill', 'none');
        showNotification('Removed from wishlist');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--gradient-primary);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initProducts);
