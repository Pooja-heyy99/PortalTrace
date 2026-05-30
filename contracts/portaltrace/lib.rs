#![cfg_attr(not(feature = "std"), no_std, no_main)]

// PortalTrace - Supply Chain Transparency dApp
// Built with ink! for Portaldot/Substrate chains

pub use self::portaltrace::PortalTrace;

#[ink::contract]
pub mod portaltrace {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    /// Product information stored on-chain
    #[ink(storage)]
    pub struct Product {
        /// Unique product identifier
        pub id: u64,
        /// Product name
        pub name: String,
        /// Manufacturer name
        pub manufacturer: String,
        /// Origin/source location
        pub origin: String,
        /// IPFS hash for detailed metadata
        pub ipfs_hash: String,
        /// Current owner account
        pub owner: AccountId,
        /// Verification status
        pub verified: bool,
    }

    /// PortalTrace smart contract for supply chain transparency
    #[ink(storage)]
    pub struct PortalTrace {
        /// Contract owner
        owner: AccountId,
        /// Mapping of product ID to product data
        products: Mapping<u64, Product>,
        /// Counter for next product ID
        next_product_id: u64,
    }

    /// Event emitted when a product is created
    #[ink(event)]
    pub struct ProductCreated {
        #[ink(topic)]
        pub id: u64,
        #[ink(topic)]
        pub creator: AccountId,
        pub name: String,
        pub manufacturer: String,
    }

    /// Event emitted when product ownership is transferred
    #[ink(event)]
    pub struct ProductTransferred {
        #[ink(topic)]
        pub product_id: u64,
        #[ink(topic)]
        pub from: AccountId,
        #[ink(topic)]
        pub to: AccountId,
    }

    /// Event emitted when a product is verified
    #[ink(event)]
    pub struct ProductVerified {
        #[ink(topic)]
        pub product_id: u64,
        #[ink(topic)]
        pub verifier: AccountId,
    }

    /// Error types for contract operations
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        /// Product with this ID already exists
        ProductAlreadyExists,
        /// Product not found
        ProductNotFound,
        /// Caller is not the product owner
        Unauthorized,
        /// Invalid operation
        InvalidOperation,
    }

    /// Result type for contract calls
    pub type Result<T> = core::result::Result<T, Error>;

    impl PortalTrace {
        /// Creates a new PortalTrace contract instance
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                owner: Self::env().caller(),
                products: Mapping::new(),
                next_product_id: 1,
            }
        }

        /// Register a new product batch on-chain
        ///
        /// # Arguments
        /// * `name` - Product name
        /// * `manufacturer` - Manufacturer name
        /// * `origin` - Product origin/source
        /// * `ipfs_hash` - IPFS hash for detailed metadata
        ///
        /// # Returns
        /// The product ID if successful
        #[ink(message)]
        pub fn create_product(
            &mut self,
            name: String,
            manufacturer: String,
            origin: String,
            ipfs_hash: String,
        ) -> Result<u64> {
            let product_id = self.next_product_id;

            // Check if product ID already exists (shouldn't happen with counter)
            if self.products.contains(&product_id) {
                return Err(Error::ProductAlreadyExists);
            }

            let caller = self.env().caller();
            let product = Product {
                id: product_id,
                name: name.clone(),
                manufacturer: manufacturer.clone(),
                origin: origin.clone(),
                ipfs_hash,
                owner: caller,
                verified: false,
            };

            // Store product
            self.products.insert(&product_id, &product);
            self.next_product_id += 1;

            // Emit event
            self.env().emit_event(ProductCreated {
                id: product_id,
                creator: caller,
                name,
                manufacturer,
            });

            Ok(product_id)
        }

        /// Transfer product ownership to another account
        ///
        /// # Arguments
        /// * `product_id` - ID of the product to transfer
        /// * `new_owner` - New owner account
        ///
        /// # Returns
        /// Success or error
        #[ink(message)]
        pub fn transfer_product(&mut self, product_id: u64, new_owner: AccountId) -> Result<()> {
            let caller = self.env().caller();

            // Get product
            let mut product = self
                .products
                .get(&product_id)
                .ok_or(Error::ProductNotFound)?;

            // Only current owner can transfer
            if product.owner != caller {
                return Err(Error::Unauthorized);
            }

            let old_owner = product.owner;
            product.owner = new_owner;

            // Update product
            self.products.insert(&product_id, &product);

            // Emit event
            self.env().emit_event(ProductTransferred {
                product_id,
                from: old_owner,
                to: new_owner,
            });

            Ok(())
        }

        /// Verify a product's authenticity
        ///
        /// # Arguments
        /// * `product_id` - ID of the product to verify
        ///
        /// # Returns
        /// Success or error
        #[ink(message)]
        pub fn verify_product(&mut self, product_id: u64) -> Result<()> {
            let caller = self.env().caller();

            // Get product
            let mut product = self
                .products
                .get(&product_id)
                .ok_or(Error::ProductNotFound)?;

            // Mark as verified
            product.verified = true;

            // Update product
            self.products.insert(&product_id, &product);

            // Emit event
            self.env().emit_event(ProductVerified {
                product_id,
                verifier: caller,
            });

            Ok(())
        }

        /// Retrieve product information by ID
        ///
        /// # Arguments
        /// * `product_id` - ID of the product to retrieve
        ///
        /// # Returns
        /// Product data or error if not found
        #[ink(message)]
        pub fn get_product(&self, product_id: u64) -> Result<Product> {
            self.products
                .get(&product_id)
                .ok_or(Error::ProductNotFound)
        }

        /// Get the current product counter (next available ID)
        #[ink(message)]
        pub fn get_next_product_id(&self) -> u64 {
            self.next_product_id
        }

        /// Check if a product exists
        #[ink(message)]
        pub fn product_exists(&self, product_id: u64) -> bool {
            self.products.contains(&product_id)
        }

        /// Get contract owner
        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test_create_product() {
            let mut contract = PortalTrace::new();
            let product_id = contract
                .create_product(
                    "Test Product".into(),
                    "Test Manufacturer".into(),
                    "Test Origin".into(),
                    "QmTest".into(),
                )
                .expect("Failed to create product");

            assert_eq!(product_id, 1);
            assert!(contract.product_exists(product_id));
        }

        #[ink::test]
        fn test_transfer_product() {
            let mut contract = PortalTrace::new();
            let product_id = contract
                .create_product(
                    "Test Product".into(),
                    "Test Manufacturer".into(),
                    "Test Origin".into(),
                    "QmTest".into(),
                )
                .expect("Failed to create product");

            let new_owner = AccountId::from([0x02; 32]);
            contract
                .transfer_product(product_id, new_owner)
                .expect("Failed to transfer product");

            let product = contract.get_product(product_id).expect("Product not found");
            assert_eq!(product.owner, new_owner);
        }

        #[ink::test]
        fn test_verify_product() {
            let mut contract = PortalTrace::new();
            let product_id = contract
                .create_product(
                    "Test Product".into(),
                    "Test Manufacturer".into(),
                    "Test Origin".into(),
                    "QmTest".into(),
                )
                .expect("Failed to create product");

            contract
                .verify_product(product_id)
                .expect("Failed to verify product");

            let product = contract.get_product(product_id).expect("Product not found");
            assert!(product.verified);
        }

        #[ink::test]
        fn test_unauthorized_transfer() {
            let mut contract = PortalTrace::new();
            let product_id = contract
                .create_product(
                    "Test Product".into(),
                    "Test Manufacturer".into(),
                    "Test Origin".into(),
                    "QmTest".into(),
                )
                .expect("Failed to create product");

            let unauthorized_account = AccountId::from([0x03; 32]);
            let new_owner = AccountId::from([0x04; 32]);

            // Set caller to unauthorized account and try to transfer
            ink::env::test::set_caller::<Environment>(unauthorized_account);
            assert_eq!(
                contract.transfer_product(product_id, new_owner),
                Err(Error::Unauthorized)
            );
        }
    }
}
