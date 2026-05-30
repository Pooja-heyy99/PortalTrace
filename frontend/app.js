/**
 * PortalTrace - Supply Chain Transparency dApp
 * Frontend Application Logic
 * 
 * This file handles:
 * - Wallet connection simulation
 * - Product registration and storage
 * - Product verification
 * - Ownership history tracking
 * - QR code generation
 * 
 * Demo Mode: Uses localStorage to simulate blockchain interactions
 * Production: Would use @polkadot/api to connect to actual blockchain
 */

// ============================================
// Global State & Configuration
// ============================================

const CONFIG = {
    // Demo mode uses localStorage instead of blockchain
    DEMO_MODE: true,
    STORAGE_KEY: 'portaltrace_products',
    HISTORY_KEY: 'portaltrace_history',
    WALLET_KEY: 'portaltrace_wallet',
};

let currentWallet = null;

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Restore wallet state
    currentWallet = localStorage.getItem(CONFIG.WALLET_KEY);
    updateWalletButton();
    
    // Load products on index page
    if (document.getElementById('productsContainer')) {
        renderProducts();
    }

    // Setup form handlers
    setupFormHandlers();
});

// ============================================
// Wallet Management
// ============================================

/**
 * Connect to a blockchain wallet (simulated in demo mode)
 */
async function connectWallet() {
    if (CONFIG.DEMO_MODE) {
        // Demo: Generate a mock wallet address
        const mockWallet = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        currentWallet = mockWallet;
        localStorage.setItem(CONFIG.WALLET_KEY, mockWallet);
        
        showAlert('✓ Wallet connected (Demo Mode)', 'success');
        console.log('Demo wallet:', mockWallet);
    } else {
        // Production: Connect to actual wallet via polkadot.js
        // Example:
        // const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
        // const extensions = await web3Enable('PortalTrace');
        // if (extensions.length === 0) throw new Error('No wallet found');
        // const accounts = await web3Accounts();
        // currentWallet = accounts[0].address;
        
        showAlert('⚠️ Production mode requires Portaldot wallet', 'warning');
    }

    updateWalletButton();
}

/**
 * Disconnect wallet and clear local data
 */
function disconnectWallet() {
    currentWallet = null;
    localStorage.removeItem(CONFIG.WALLET_KEY);
    updateWalletButton();
    showAlert('Wallet disconnected', 'info');
}

/**
 * Update wallet button UI based on connection status
 */
function updateWalletButton() {
    const btn = document.getElementById('connectWalletBtn');
    if (!btn) return;

    if (currentWallet) {
        const shortAddr = currentWallet.substring(0, 6) + '...' + currentWallet.substring(currentWallet.length - 4);
        btn.textContent = shortAddr;
        btn.onclick = disconnectWallet;
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    } else {
        btn.textContent = 'Connect Wallet';
        btn.onclick = connectWallet;
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
    }
}

// ============================================
// Product Management
// ============================================

/**
 * Register a new product batch on-chain
 */
async function registerProduct(name, manufacturer, origin, ipfsHash) {
    if (!currentWallet) {
        showAlert('⚠️ Please connect your wallet first', 'warning');
        await connectWallet();
        return null;
    }

    try {
        // Generate product ID
        const products = getAllProducts();
        const productId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

        // Create product object
        const product = {
            id: productId,
            name,
            manufacturer,
            origin,
            ipfs_hash: ipfsHash || generateIPFSHash(),
            owner: currentWallet,
            verified: false,
            created_at: new Date().toISOString(),
        };

        // Save to localStorage (demo mode)
        saveProduct(product);

        // Record in ownership history
        recordOwnershipEvent(productId, 'Created', currentWallet, 'Product registered on blockchain');

        // Show success
        showAlert(`✓ Product #${productId} registered successfully!`, 'success');
        console.log('Product registered:', product);

        return product;
    } catch (error) {
        showAlert(`❌ Error registering product: ${error.message}`, 'error');
        console.error('Registration error:', error);
        return null;
    }
}

/**
 * Verify a product's authenticity
 */
async function verifyProduct(productId) {
    try {
        const product = getProduct(productId);

        if (!product) {
            throw new Error(`Product #${productId} not found on the blockchain`);
        }

        // In demo mode, mark as verified
        if (!product.verified) {
            product.verified = true;
            saveProduct(product);
            recordOwnershipEvent(productId, 'Verified', currentWallet || 'Anonymous', 'Product verified');
        }

        showAlert(`✓ Product #${productId} verified authentic!`, 'success');
        return product;
    } catch (error) {
        showAlert(`❌ Verification failed: ${error.message}`, 'error');
        console.error('Verification error:', error);
        return null;
    }
}

/**
 * Transfer product ownership to another party
 */
async function transferProduct(productId, newOwner) {
    if (!currentWallet) {
        showAlert('⚠️ Please connect your wallet first', 'warning');
        return false;
    }

    try {
        const product = getProduct(productId);

        if (!product) {
            throw new Error(`Product #${productId} not found`);
        }

        if (product.owner !== currentWallet) {
            throw new Error('Only the current owner can transfer this product');
        }

        const oldOwner = product.owner;
        product.owner = newOwner;
        saveProduct(product);

        recordOwnershipEvent(productId, 'Transferred', newOwner, `Transferred from ${oldOwner.substring(0, 6)}...`);

        showAlert(`✓ Product #${productId} transferred to ${newOwner.substring(0, 6)}...`, 'success');
        return true;
    } catch (error) {
        showAlert(`❌ Transfer failed: ${error.message}`, 'error');
        console.error('Transfer error:', error);
        return false;
    }
}

// ============================================
// Storage & Data Management
// ============================================

/**
 * Save product to storage
 */
function saveProduct(product) {
    const products = getAllProducts();
    const index = products.findIndex(p => p.id === product.id);

    if (index >= 0) {
        products[index] = product;
    } else {
        products.push(product);
    }

    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(products));
}

/**
 * Get all products from storage
 */
function getAllProducts() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Get a single product by ID
 */
function getProduct(productId) {
    const products = getAllProducts();
    return products.find(p => p.id === parseInt(productId));
}

/**
 * Delete a product (admin only)
 */
function deleteProduct(productId) {
    const products = getAllProducts();
    const filtered = products.filter(p => p.id !== parseInt(productId));
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(filtered));
}

// ============================================
// Ownership History
// ============================================

/**
 * Record an ownership event (creation, transfer, verification)
 */
function recordOwnershipEvent(productId, eventType, actor, details) {
    const history = getOwnershipHistory(productId);

    const event = {
        timestamp: new Date().toISOString(),
        type: eventType,
        actor: actor,
        details: details,
    };

    history.push(event);

    const allHistory = JSON.parse(localStorage.getItem(CONFIG.HISTORY_KEY) || '{}');
    allHistory[productId] = history;
    localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(allHistory));
}

/**
 * Get ownership history for a product
 */
function getOwnershipHistory(productId) {
    const allHistory = JSON.parse(localStorage.getItem(CONFIG.HISTORY_KEY) || '{}');
    return allHistory[productId] || [];
}

/**
 * Render ownership history as HTML
 */
function renderOwnershipHistory(productId) {
    const history = getOwnershipHistory(productId);

    if (history.length === 0) {
        return '<p style="color: var(--text-muted); text-align: center;">No history recorded yet</p>';
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';

    history.forEach((event, index) => {
        const date = new Date(event.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        const actorShort = event.actor.substring ? event.actor.substring(0, 6) + '...' : event.actor;

        let eventColor = 'var(--accent)';
        let eventIcon = '→';

        if (event.type === 'Created') {
            eventColor = 'var(--primary)';
            eventIcon = '✚';
        } else if (event.type === 'Verified') {
            eventColor = '#22c55e';
            eventIcon = '✓';
        } else if (event.type === 'Transferred') {
            eventColor = 'var(--accent)';
            eventIcon = '→';
        }

        html += `
            <div style="display: flex; gap: 1rem; padding: 1rem; background: var(--bg-darker); border-radius: var(--radius-md); border-left: 3px solid ${eventColor};">
                <div style="flex: 0 0 auto; width: 30px; height: 30px; background: ${eventColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                    ${eventIcon}
                </div>
                <div style="flex: 1;">
                    <p style="font-weight: 600; margin-bottom: 0.25rem; color: ${eventColor};">${event.type}</p>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${event.details}</p>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">
                        By: <code>${actorShort}</code> on ${dateStr}
                    </p>
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// ============================================
// UI Rendering
// ============================================

/**
 * Render products list on the homepage
 */
function renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    const products = getAllProducts();

    if (products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); grid-column: 1/-1; padding: 2rem;">
                <p style="font-size: 1.1rem;">No products registered yet</p>
                <p>Be the first to register a product and start building supply chain transparency!</p>
            </div>
        `;
        return;
    }

    // Show most recent products first
    const recentProducts = [...products].reverse().slice(0, 6);

    container.innerHTML = recentProducts.map(product => `
        <div class="product-card">
            <div class="product-id">ID: ${product.id}</div>
            
            <div class="product-name">${escapeHtml(product.name)}</div>
            
            <div class="product-info">
                <strong>Manufacturer:</strong> ${escapeHtml(product.manufacturer)}
            </div>
            
            <div class="product-info">
                <strong>Origin:</strong> ${escapeHtml(product.origin)}
            </div>

            <div class="product-info">
                <strong>Owner:</strong> <code style="font-size: 0.85rem;">${product.owner.substring(0, 10)}...</code>
            </div>

            <div class="product-status">
                ${product.verified 
                    ? '<div class="badge badge-verified">✓ Verified</div>' 
                    : '<div class="badge badge-pending">⏱ Pending Verification</div>'
                }
                ${product.owner === currentWallet 
                    ? '<div class="badge badge-owner">👤 You Own This</div>' 
                    : ''
                }
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                <button class="btn btn-secondary btn-sm" onclick="quickVerify(${product.id})">
                    Verify
                </button>
                <a href="verify.html?product=${product.id}" class="btn btn-outline btn-sm" style="flex: 1;">
                    View Details
                </a>
            </div>
        </div>
    `).join('');
}

/**
 * Quick verify button callback
 */
function quickVerify(productId) {
    verifyProduct(productId);
    setTimeout(() => {
        renderProducts();
    }, 500);
}

/**
 * Display alert message
 */
function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');
    if (!container) return;

    const alertId = 'alert_' + Date.now();
    const alertClass = `alert alert-${type}`;

    const alertElement = document.createElement('div');
    alertElement.id = alertId;
    alertElement.className = alertClass;
    alertElement.textContent = message;

    container.appendChild(alertElement);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        const elem = document.getElementById(alertId);
        if (elem) {
            elem.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => elem.remove(), 300);
        }
    }, 5000);
}

/**
 * Generate a mock IPFS hash
 */
function generateIPFSHash() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let hash = 'Qm';
    for (let i = 0; i < 44; i++) {
        hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hash;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

// ============================================
// Form Handlers
// ============================================

/**
 * Setup form submission handlers
 */
function setupFormHandlers() {
    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('productName').value;
            const manufacturer = document.getElementById('manufacturer').value;
            const origin = document.getElementById('origin').value;
            const ipfsHash = document.getElementById('ipfsHash').value;

            const product = await registerProduct(name, manufacturer, origin, ipfsHash);

            if (product) {
                // Clear form
                registerForm.reset();
                // Refresh products list
                setTimeout(() => renderProducts(), 500);
            }
        });
    }

    // Verification form
    const verifyForm = document.getElementById('verifyForm');
    if (verifyForm) {
        verifyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const productId = document.getElementById('productId').value;
            const product = await verifyProduct(productId);

            if (product) {
                // Show details
                displayProductDetails(product);
            }
        });
    }

    // Check for URL parameter on verify page
    const params = new URLSearchParams(window.location.search);
    const productIdParam = params.get('product');
    if (productIdParam && document.getElementById('verifyForm')) {
        document.getElementById('productId').value = productIdParam;
        verifyForm.dispatchEvent(new Event('submit'));
    }
}

/**
 * Display product details on verify page
 */
function displayProductDetails(product) {
    const detailsSection = document.getElementById('detailsSection');
    const featuresSection = document.getElementById('featuresSection');

    if (!detailsSection) return;

    // Hide features, show details
    if (featuresSection) featuresSection.style.display = 'none';
    detailsSection.style.display = 'block';

    // Populate details
    document.getElementById('detailsName').textContent = escapeHtml(product.name);
    document.getElementById('detailsId').textContent = `Product ID: ${product.id}`;
    document.getElementById('detailsManufacturer').textContent = escapeHtml(product.manufacturer);
    document.getElementById('detailsOrigin').textContent = escapeHtml(product.origin);
    document.getElementById('detailsIpfs').textContent = product.ipfs_hash;
    document.getElementById('detailsOwner').textContent = product.owner;

    // Update verification status
    const verifyStatus = document.getElementById('verifyStatus');
    const verifyIcon = document.getElementById('verifyIcon');
    const badge = document.getElementById('verificationBadge');

    if (product.verified) {
        verifyStatus.textContent = 'Verified';
        verifyStatus.style.color = '#22c55e';
        verifyIcon.textContent = '✓';
        badge.className = 'badge badge-verified';
        badge.textContent = '✓ Verified';
    } else {
        verifyStatus.textContent = 'Pending';
        verifyStatus.style.color = '#fb923c';
        verifyIcon.textContent = '⏱';
        badge.className = 'badge badge-pending';
        badge.textContent = '⏱ Pending Verification';
    }

    // Generate QR code
    generateSimpleQRCode(product.id.toString(), 'qrCode');

    // Render ownership history
    const historyContainer = document.getElementById('ownershipHistory');
    historyContainer.innerHTML = renderOwnershipHistory(product.id);

    // Scroll to details
    detailsSection.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// Demo Data
// ============================================

/**
 * Load demo data (for testing)
 */
function loadDemoData() {
    const demoProducts = [
        {
            id: 1,
            name: 'Organic Coffee Beans',
            manufacturer: 'Fair Trade Coffee Co.',
            origin: 'Ethiopia, Addis Ababa',
            ipfs_hash: 'QmExample1234567890abcdefg',
            owner: currentWallet || '0xDemo1',
            verified: true,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 2,
            name: 'Dark Chocolate Bar',
            manufacturer: 'Artisan Chocolates Ltd.',
            origin: 'Ghana, Accra',
            ipfs_hash: 'QmExample2234567890abcdefg',
            owner: currentWallet || '0xDemo2',
            verified: true,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(demoProducts));

    // Add history
    const history = {
        '1': [
            {
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'Created',
                actor: currentWallet || '0xDemo1',
                details: 'Product registered on blockchain'
            },
            {
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'Verified',
                actor: currentWallet || '0xVerifier1',
                details: 'Product verified authentic'
            }
        ],
        '2': [
            {
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'Created',
                actor: currentWallet || '0xDemo2',
                details: 'Product registered on blockchain'
            },
            {
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'Verified',
                actor: currentWallet || '0xVerifier1',
                details: 'Product verified authentic'
            }
        ]
    };

    localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(history));
    
    showAlert('✓ Demo data loaded', 'info');
    if (document.getElementById('productsContainer')) {
        renderProducts();
    }
}

// Make demo function available globally for testing
window.loadDemoData = loadDemoData;
