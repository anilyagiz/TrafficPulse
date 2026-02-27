#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Balance(Address),
    Allowance(Address, Address),
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

    pub fn mint(env: Env, admin: Address, to: Address, amount: i128) {
        admin.require_auth();

        let key = DataKey::Balance(to.clone());
        let balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(balance + amount));

        env.events()
            .publish((Symbol::new(&env, "mint"), to), amount);
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) -> bool {
        from.require_auth();

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

    pub fn balance(env: Env, id: Address) -> i128 {
        let key = DataKey::Balance(id);
        env.storage().persistent().get(&key).unwrap_or(0)
    }

    pub fn approve(env: Env, owner: Address, spender: Address, amount: i128) {
        owner.require_auth();

        let key = DataKey::Allowance(owner.clone(), spender.clone());
        env.storage().persistent().set(&key, &amount);

        env.events()
            .publish((Symbol::new(&env, "approve"), owner), (spender, amount));
    }

    pub fn allowance(env: Env, owner: Address, spender: Address) -> i128 {
        let key = DataKey::Allowance(owner, spender);
        env.storage().persistent().get(&key).unwrap_or(0)
    }
}
