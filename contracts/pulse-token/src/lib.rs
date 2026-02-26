#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol};

pub trait SACSpec {
    fn mint(env: Env, to: Address, amount: i128);
    fn transfer(env: Env, from: Address, to: Address, amount: i128) -> bool;
    fn balance(env: Env, id: Address) -> i128;
    fn approve(env: Env, owner: Address, spender: Address, amount: i128);
    fn allowance(env: Env, owner: Address, spender: Address) -> i128;
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

    pub fn mint(env: Env, to: Address, amount: i128) {
        to.require_auth();
        
        let key = Symbol::for_string(&env, format!("balance_{}", to));
        let balance: i128 = env.storage().instance().get(&key).unwrap_or(0);
        env.storage().instance().set(&key, &(balance + amount));
        
        env.events().publish((Symbol::short("mint"), to, amount));
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) -> bool {
        from.require_auth();
        
        let from_key = Symbol::for_string(&env, format!("balance_{}", from));
        let from_balance: i128 = env.storage().instance().get(&from_key).unwrap_or(0);
        
        if from_balance < amount {
            return false;
        }
        
        env.storage().instance().set(&from_key, &(from_balance - amount));
        
        let to_key = Symbol::for_string(&env, format!("balance_{}", to));
        let to_balance: i128 = env.storage().instance().get(&to_key).unwrap_or(0);
        env.storage().instance().set(&to_key, &(to_balance + amount));
        
        env.events().publish((Symbol::short("transfer"), from, to, amount));
        
        true
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        let key = Symbol::for_string(&env, format!("balance_{}", id));
        env.storage().instance().get(&key).unwrap_or(0)
    }

    pub fn approve(env: Env, owner: Address, spender: Address, amount: i128) {
        owner.require_auth();
        
        let key = Symbol::for_string(&env, format!("allowance_{}_{}", owner, spender));
        env.storage().instance().set(&key, &amount);
        
        env.events().publish((Symbol::short("approve"), owner, spender, amount));
    }

    pub fn allowance(env: Env, owner: Address, spender: Address) -> i128 {
        let key = Symbol::for_string(&env, format!("allowance_{}_{}", owner, spender));
        env.storage().instance().get(&key).unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
