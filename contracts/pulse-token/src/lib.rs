#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Balance(Address),
    Allowance(Address, Address),
    Admin,
    TotalSupply,
}

#[contract]
pub struct PulseToken;

#[contractimpl]
impl PulseToken {
    pub fn name(env: Env) -> String {
        String::from_str(&env, "PULSE")
    }

    pub fn symbol(env: Env) -> String {
        String::from_str(&env, "PLS")
    }

    pub fn decimals(env: Env) -> u32 {
        18
    }

    /// Initialize the token with an admin address.
    /// Must be called once before any minting.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
        env.events()
            .publish((Symbol::new(&env, "initialize"),), admin);
    }

    /// Mint new tokens. Only the stored admin can call this.
    pub fn mint(env: Env, admin: Address, to: Address, amount: i128) {
        admin.require_auth();

        // SECURITY: Verify caller is the stored admin
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized");
        if admin != stored_admin {
            panic!("unauthorized: only admin can mint");
        }

        // SECURITY: Prevent zero or negative amounts
        if amount <= 0 {
            panic!("invalid amount: must be positive");
        }

        let key = DataKey::Balance(to.clone());
        let balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(balance + amount));

        // Update total supply
        let total_supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(total_supply + amount));

        env.events()
            .publish((Symbol::new(&env, "mint"), to), amount);
    }

    /// Transfer tokens from caller's balance to another address.
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) -> bool {
        from.require_auth();

        // SECURITY: Prevent zero or negative amounts
        if amount <= 0 {
            panic!("invalid amount: must be positive");
        }

        let from_key = DataKey::Balance(from.clone());
        let from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);

        if from_balance < amount {
            return false;
        }

        env.storage()
            .persistent()
            .set(&from_key, &(from_balance - amount));

        let to_key = DataKey::Balance(to.clone());
        let to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        env.storage()
            .persistent()
            .set(&to_key, &(to_balance + amount));

        env.events()
            .publish((Symbol::new(&env, "transfer"), from), (to, amount));
        true
    }

    /// Transfer tokens using allowance. Used by contracts to pull approved tokens.
    /// SECURITY: This is required for the betting contract to work properly.
    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) -> bool {
        spender.require_auth();

        // SECURITY: Prevent zero or negative amounts
        if amount <= 0 {
            panic!("invalid amount: must be positive");
        }

        // Check allowance
        let allowance_key = DataKey::Allowance(from.clone(), spender.clone());
        let allowed: i128 = env.storage().persistent().get(&allowance_key).unwrap_or(0);

        if allowed < amount {
            return false;
        }

        // Check balance
        let from_key = DataKey::Balance(from.clone());
        let from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);

        if from_balance < amount {
            return false;
        }

        // Update allowance
        env.storage()
            .persistent()
            .set(&allowance_key, &(allowed - amount));

        // Update balances
        env.storage()
            .persistent()
            .set(&from_key, &(from_balance - amount));

        let to_key = DataKey::Balance(to.clone());
        let to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        env.storage()
            .persistent()
            .set(&to_key, &(to_balance + amount));

        env.events()
            .publish((Symbol::new(&env, "transfer_from"), spender), (from, to, amount));
        true
    }

    /// Get balance of an address.
    pub fn balance(env: Env, id: Address) -> i128 {
        let key = DataKey::Balance(id);
        env.storage().persistent().get(&key).unwrap_or(0)
    }

    /// Approve another address to spend tokens on your behalf.
    pub fn approve(env: Env, owner: Address, spender: Address, amount: i128) {
        owner.require_auth();

        // SECURITY: Prevent negative amounts (0 is allowed to revoke approval)
        if amount < 0 {
            panic!("invalid amount: cannot be negative");
        }

        let key = DataKey::Allowance(owner.clone(), spender.clone());
        env.storage().persistent().set(&key, &amount);

        env.events()
            .publish((Symbol::new(&env, "approve"), owner), (spender, amount));
    }

    /// Check allowance of a spender for an owner.
    pub fn allowance(env: Env, owner: Address, spender: Address) -> i128 {
        let key = DataKey::Allowance(owner, spender);
        env.storage().persistent().get(&key).unwrap_or(0)
    }

    /// Get total supply of tokens.
    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }

    /// Burn tokens from an address. Only admin can call this.
    pub fn burn(env: Env, admin: Address, from: Address, amount: i128) {
        admin.require_auth();

        // SECURITY: Verify caller is the stored admin
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized");
        if admin != stored_admin {
            panic!("unauthorized: only admin can burn");
        }

        // SECURITY: Prevent zero or negative amounts
        if amount <= 0 {
            panic!("invalid amount: must be positive");
        }

        let key = DataKey::Balance(from.clone());
        let balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);

        if balance < amount {
            panic!("insufficient balance");
        }

        env.storage().persistent().set(&key, &(balance - amount));

        // Update total supply
        let total_supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(total_supply - amount));

        env.events()
            .publish((Symbol::new(&env, "burn"), from), amount);
    }

    /// Get the admin address.
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Admin)
    }
}