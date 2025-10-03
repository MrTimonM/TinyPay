module tinypay::payment {
    use std::signer;
    use std::error;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};
    use aptos_std::simple_map::{Self, SimpleMap};

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NONCE_ALREADY_USED: u64 = 3;
    const E_INVALID_AMOUNT: u64 = 4;
    const E_INSUFFICIENT_BALANCE: u64 = 5;

    /// Payment Registry to track used nonces per sender
    struct PaymentRegistry has key {
        // Maps sender address to their used nonces
        used_nonces: Table<address, SimpleMap<u64, bool>>,
    }

    #[event]
    struct PaymentSettledEvent has drop, store {
        sender: address,
        recipient: address,
        amount: u64,
        nonce: u64,
        timestamp: u64,
    }

    /// Initialize the payment registry (admin function)
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<PaymentRegistry>(admin_addr), error::already_exists(E_ALREADY_INITIALIZED));
        
        move_to(admin, PaymentRegistry {
            used_nonces: table::new(),
        });
    }

    /// Check if a nonce has been used for a given sender
    public fun is_nonce_used(registry_addr: address, sender: address, nonce: u64): bool acquires PaymentRegistry {
        if (!exists<PaymentRegistry>(registry_addr)) {
            return false
        };
        
        let registry = borrow_global<PaymentRegistry>(registry_addr);
        
        if (!table::contains(&registry.used_nonces, sender)) {
            return false
        };
        
        let sender_nonces = table::borrow(&registry.used_nonces, sender);
        simple_map::contains_key(sender_nonces, &nonce)
    }

    /// Mark a nonce as used for a given sender
    fun mark_nonce_used(registry_addr: address, sender: address, nonce: u64) acquires PaymentRegistry {
        let registry = borrow_global_mut<PaymentRegistry>(registry_addr);
        
        if (!table::contains(&registry.used_nonces, sender)) {
            table::add(&mut registry.used_nonces, sender, simple_map::create());
        };
        
        let sender_nonces = table::borrow_mut(&mut registry.used_nonces, sender);
        simple_map::add(sender_nonces, nonce, true);
    }

    /// Process a payment with nonce-based double-spend prevention
    /// This function is called by the merchant who has the signed transaction
    public entry fun pay(
        sender: &signer,
        recipient: address,
        amount: u64,
        nonce: u64,
        registry_addr: address,
    ) acquires PaymentRegistry {
        let sender_addr = signer::address_of(sender);
        
        // Validate amount
        assert!(amount > 0, error::invalid_argument(E_INVALID_AMOUNT));
        
        // Check if nonce has been used (double-spend prevention)
        assert!(!is_nonce_used(registry_addr, sender_addr, nonce), error::invalid_state(E_NONCE_ALREADY_USED));
        
        // Check sender has sufficient balance
        let sender_balance = coin::balance<AptosCoin>(sender_addr);
        assert!(sender_balance >= amount, error::invalid_state(E_INSUFFICIENT_BALANCE));
        
        // Mark nonce as used BEFORE transfer to prevent reentrancy
        mark_nonce_used(registry_addr, sender_addr, nonce);
        
        // Transfer funds
        coin::transfer<AptosCoin>(sender, recipient, amount);
        
        // Emit payment settled event
        event::emit(PaymentSettledEvent {
            sender: sender_addr,
            recipient,
            amount,
            nonce,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    /// Direct payment function for testing (without nonce checking)
    public entry fun direct_pay(
        sender: &signer,
        recipient: address,
        amount: u64,
    ) {
        coin::transfer<AptosCoin>(sender, recipient, amount);
    }

    #[test_only]
    public fun init_for_test(admin: &signer) {
        initialize(admin);
    }
}

