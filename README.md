# PortalTrace 🔗

**Supply Chain Transparency dApp built on Portaldot**

A hackathon-ready Web3 application for transparent, immutable product registration, ownership transfer, and authenticity verification on the blockchain.

---

## 🎯 Problem

Modern supply chains suffer from:
- **Counterfeit Products**: No way to verify authenticity
- **Lack of Transparency**: Unclear origin and custody chain
- **Trust Issues**: Manual records are easily manipulated
- **Consumer Uncertainty**: No easy way to verify product genuineness

## 💡 Solution

**PortalTrace** leverages blockchain to create an immutable, transparent supply chain:
- 📦 **Register products** with complete metadata on-chain
- 🔗 **Track ownership transfers** with permanent audit trail
- ✅ **Verify authenticity** via QR codes and blockchain confirmation
- 📱 **Mobile-friendly** dashboard for easy access
- 🌍 **Portaldot-powered** for scalable, eco-friendly operations

---

## 🏗️ Architecture

### Smart Contract (Rust/ink!)
```
PortalTrace Contract
├── Storage
│   ├── owner: AccountId (contract owner)
│   └── products: Mapping<u64, Product>
│
├── Product Struct
│   ├── id: u64
│   ├── name: String
│   ├── manufacturer: String
│   ├── origin: String
│   ├── ipfs_hash: String (metadata pointer)
│   ├── owner: AccountId
│   └── verified: bool
│
├── Functions
│   ├── new() - Initialize contract
│   ├── create_product() - Register new batch
│   ├── transfer_product() - Change ownership
│   ├── verify_product() - Mark as verified
│   └── get_product() - Retrieve product data
│
└── Events
    ├── ProductCreated
    ├── ProductTransferred
    └── ProductVerified
```

### Frontend (HTML/CSS/JavaScript)
```
PortalTrace Dashboard
├── Pages
│   ├── index.html - Product registration & listing
│   └── verify.html - Authenticity verification
│
├── Features
│   ├── Wallet connection
│   ├── Product registration form
│   ├── Recent products display
│   ├── QR code generation
│   ├── Ownership history tracking
│   └── Responsive design (dark mode, glassmorphism)
│
└── Storage
    ├── localStorage (demo fallback)
    ├── IPFS hashes (metadata references)
    └── Blockchain (production)
```

---

## 🚀 Getting Started

### Prerequisites
- **Rust** (for smart contract development)
- **cargo-contract** (for ink! contracts)
  ```bash
  cargo install cargo-contract
  ```
- **Web Browser** (for frontend - no dependencies needed)
- **Node.js** (optional, for local development server)

### Quick Start

#### 1. Clone the Repository
```bash
cd PortalTrace
```

#### 2. Run Frontend (Demo Mode)
Simply open `frontend/index.html` in your browser:
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server frontend

# Or just open directly in browser
open frontend/index.html
```

The frontend runs entirely in the browser with **no npm install required**.

#### 3. Test the Demo
1. Click "Connect Wallet" to create a demo wallet
2. Register a product with the form
3. View recent products
4. Use the "Verify" page to check product authenticity
5. Inspect the browser's localStorage to see stored data

#### 4. Build Smart Contract
```bash
cd contracts/portaltrace
cargo build --release
```

Compiled contract: `target/ink/portaltrace.wasm`

#### 5. Deploy to Portaldot (Production)
```bash
# Using cargo-contract
cargo contract build --release

# Deploy via Portaldot dashboard or CLI
# (requires POT token access - see Deployment section)
```

### Live Portaldot Setup

To switch the app from demo mode to a real on-chain flow, update these files in GitHub:
- `frontend/config.js` for the RPC endpoint, deployed contract address, metadata path, and POT token branding.
- `frontend/app.js` for the wallet and contract transaction logic.
- `contracts/portaltrace/lib.rs` for the ink! contract model and on-chain behavior.
- `frontend/index.html` and `frontend/verify.html` for the shared config loader.

The frontend expects a generated contract metadata file at `frontend/assets/portaltrace.contract.json` when live mode is enabled.

---

## 📋 Project Structure

```
PortalTrace/
│
├── contracts/
│   └── portaltrace/
│       ├── Cargo.toml          # Smart contract dependencies
│       ├── lib.rs              # ink! contract code
│       └── src/lib.rs          # Alternative layout
│
├── frontend/
│   ├── index.html              # Registration page
│   ├── verify.html             # Verification page
│   ├── style.css               # Design system & responsive styles
│   └── app.js                  # Application logic
│
├── assets/                      # Images, logos, etc.
│
├── README.md                    # This file
├── demo-script.md              # 2-3 minute presentation script
└── .gitignore
```

---

## 🎮 Usage Guide

### For Product Manufacturers

**Register a Product Batch:**
1. Navigate to the "Register" page
2. Fill in product details:
   - Product Name (e.g., "Organic Coffee Beans")
   - Manufacturer (e.g., "Fair Trade Coffee Co.")
   - Origin (e.g., "Ethiopia, Addis Ababa")
   - IPFS Hash (optional - auto-generated if empty)
3. Click "Register on Blockchain"
4. Product receives unique ID
5. Share product ID or QR code with distributors

**Transfer Ownership:**
- Current owner can transfer to next party in supply chain
- Creates permanent audit trail on blockchain
- Only registered product owner can initiate transfer

### For Consumers/Retailers

**Verify Product Authenticity:**
1. Navigate to "Verify" page
2. Enter Product ID or scan QR code
3. View:
   - Product origin and manufacturer
   - Current owner
   - Complete ownership history
   - Verification status
   - IPFS metadata link

---

## 🔐 Smart Contract Functions

### `new()`
Initializes the contract. Called once during deployment.

### `create_product(name, manufacturer, origin, ipfs_hash) -> Result<u64>`
Registers a new product batch.
- **Parameters:**
  - `name`: Product name
  - `manufacturer`: Manufacturer identifier
  - `origin`: Geographic origin
  - `ipfs_hash`: IPFS hash for detailed metadata
- **Returns:** Product ID (u64)
- **Events:** Emits `ProductCreated`

### `transfer_product(product_id, new_owner) -> Result<()>`
Transfers product ownership.
- **Parameters:**
  - `product_id`: ID of product to transfer
  - `new_owner`: Account of new owner
- **Validation:** Only current owner can transfer
- **Events:** Emits `ProductTransferred`

### `verify_product(product_id) -> Result<()>`
Marks a product as verified.
- **Parameters:**
  - `product_id`: ID of product to verify
- **Events:** Emits `ProductVerified`

### `get_product(product_id) -> Result<Product>`
Retrieves product data.
- **Parameters:**
  - `product_id`: ID of product
- **Returns:** Complete Product struct

---

## 🎨 Design System

**Color Palette:**
- Primary: `#8b5cf6` (Purple)
- Secondary: `#6366f1` (Indigo)
- Accent: `#06b6d4` (Cyan)
- Background: `#0f172a` (Dark Blue)

**Components:**
- Glassmorphism cards with blur effects
- Gradient text and buttons
- Smooth animations and transitions
- Dark mode for reduced eye strain
- Responsive grid layouts

**Typography:**
- System fonts for performance
- Clear hierarchy with size and weight
- Monospace for addresses and hashes

---

## 📱 Browser Support

- Chrome/Brave 90+
- Firefox 88+
- Safari 14+
- Edge 90+

No polyfills required for modern browsers.

---

## 🔌 API Reference

### JavaScript Functions

#### `connectWallet()`
Connects to blockchain wallet or creates demo wallet.
```javascript
await connectWallet();
```

#### `registerProduct(name, manufacturer, origin, ipfsHash)`
Registers new product.
```javascript
const product = await registerProduct(
    'Coffee',
    'Fair Trade Co.',
    'Ethiopia',
    'QmXxx...'
);
```

#### `verifyProduct(productId)`
Verifies product authenticity.
```javascript
const product = await verifyProduct(1);
```

#### `transferProduct(productId, newOwner)`
Transfers ownership (owner only).
```javascript
const success = await transferProduct(1, '0x...');
```

#### `getProduct(productId)`
Retrieves product data.
```javascript
const product = getProduct(1);
```

#### `renderProducts()`
Displays products list.
```javascript
renderProducts();
```

#### `loadDemoData()`
Loads sample products for testing.
```javascript
loadDemoData();
```

---

## 📊 Data Models

### Product
```javascript
{
    id: u64,                        // Unique identifier
    name: String,                   // Product name
    manufacturer: String,           // Manufacturer name
    origin: String,                 // Geographic origin
    ipfs_hash: String,              // Metadata pointer
    owner: AccountId,               // Current owner
    verified: bool,                 // Verification status
    created_at: ISO8601String       // Registration timestamp
}
```

### OwnershipEvent
```javascript
{
    timestamp: ISO8601String,       // When event occurred
    type: "Created" | "Transferred" | "Verified",
    actor: AccountId,               // Account that triggered event
    details: String                 // Additional context
}
```

---

## ⚡ Demo Mode vs Production

### Demo Mode (Current)
- ✅ No blockchain connection required
- ✅ Uses localStorage for data persistence
- ✅ No wallet needed (generates demo wallet)
- ✅ Perfect for testing UI/UX
- ❌ Data not immutable
- ❌ No actual blockchain verification

### Production Mode
- ✅ Real blockchain immutability
- ✅ Actual wallet connection (polkadot.js)
- ✅ Tamper-proof audit trail
- ✅ IPFS integration for metadata
- ❌ Requires Portaldot network access
- ❌ Requires POT tokens for deployment

**To enable production mode:**
1. Install `@polkadot/api` and `@polkadot/extension-dapp`
2. Set `CONFIG.DEMO_MODE = false` in `app.js`
3. Update smart contract interaction code
4. Deploy contract to Portaldot testnet/mainnet

---

## 📦 Deployment Instructions

### Smart Contract Deployment

#### Portaldot Testnet
```bash
# 1. Build contract
cd contracts/portaltrace
cargo contract build --release

# 2. Upload to Portaldot
# Use Portaldot's contract upload interface or CLI

# 3. Instantiate contract
# Call constructor with initial parameters
```

**Deployment to Portaldot pending POT token access**

*This is a hackathon submission. Full deployment requires POT tokens for transaction fees. The smart contract is production-ready and fully tested.*

#### Substrate-based Chains
```bash
# Deploy to any Substrate chain with ink! support
# Update RPC endpoint in deployment script
# Follow substrate.io deployment guide
```

### Frontend Deployment

#### GitHub Pages
```bash
# Push frontend/ folder to gh-pages branch
git branch -D gh-pages
git subtree split --prefix frontend -b gh-pages
git push origin gh-pages -f
```

#### Vercel / Netlify
```bash
# Connect repository to Vercel/Netlify
# Configure build settings:
#   - Root: frontend/
#   - Build command: (none)
#   - Publish directory: frontend/
```

#### Traditional Hosting
```bash
# Upload frontend/ folder to any web server
# No build process required
# No Node.js required
```

---

## 🧪 Testing

### Unit Tests (Smart Contract)
```bash
cd contracts/portaltrace
cargo test
```

### Frontend Testing
Open `index.html` in browser and:
1. Test product registration form
2. Verify product listing updates
3. Check localStorage persistence
4. Test responsive design on mobile
5. Verify QR code generation

### Demo Workflow
```javascript
// In browser console:
loadDemoData();          // Load sample products
connectWallet();         // Connect wallet
renderProducts();        // Display products
```

---

## 🐛 Troubleshooting

### Products not appearing
- Check browser's localStorage (DevTools > Application > Storage)
- Clear localStorage and reload: `localStorage.clear()`
- Call `loadDemoData()` to load samples

### Wallet connection fails
- Make sure you're using a modern browser
- Check browser console for errors (F12)
- In production, install Polkadot.js wallet extension

### QR codes not generating
- Browser console should show any errors
- QR library is built into verify.html
- Check browser's JavaScript is enabled

### Blockchain operations fail
- Verify chain connection in browser console
- Check account has sufficient tokens
- Verify smart contract is deployed at correct address

---

## 📚 Resources

- **Portaldot**: https://portaldot.io
- **ink! Documentation**: https://docs.rs/ink/
- **Substrate Docs**: https://docs.substrate.io
- **Polkadot.js**: https://polkadot.js.org

---

## 🏆 Hackathon Details

**Event**: Portaldot Mini Hackathon  
**Category**: Supply Chain / Web3 DApps  
**Tech Stack**:
- Smart Contract: Rust + ink!
- Frontend: HTML + CSS + Vanilla JavaScript
- Storage: Portaldot Blockchain + IPFS
- Network: Portaldot / Substrate-based chains

**Features Completed**:
- ✅ Full-stack dApp (frontend + smart contract)
- ✅ Product registration on-chain
- ✅ Ownership transfer mechanism
- ✅ Product verification system
- ✅ QR code generation
- ✅ Responsive UI with modern design
- ✅ Demo mode for testing without blockchain
- ✅ Complete documentation
- ✅ Ready-to-deploy smart contract

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Development Notes

### Code Quality
- Smart contract includes comprehensive error handling
- Frontend uses vanilla JS to avoid dependencies
- All code is commented for clarity
- Responsive design tested on mobile browsers

### Performance
- No npm dependencies (frontend)
- Smart contract optimized for Portaldot
- localStorage caching for faster loads
- Efficient event emission in contract

### Security Considerations
- Ownership validation on transfers
- HTML escaping to prevent XSS
- No sensitive data in localStorage (demo only)
- Production should use proper wallet integration

---

## 🤝 Contributing

This is a hackathon submission. For the submitted version, please refer to the original repository. Community improvements welcome!

---

## 📞 Support

For questions or issues:
1. Check this README
2. Review code comments
3. Check browser console for errors
4. Test with demo data
5. Refer to linked documentation

---

**Made with 💜 for the Portaldot Mini Hackathon**

`PortalTrace` - Transparent supply chains, powered by blockchain.
