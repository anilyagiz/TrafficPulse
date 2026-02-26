#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol};

#[contract]
pub struct TrafficPulseContract;

#[contractimpl]
impl TrafficPulseContract {
    pub fn place_bet(env: Env, round_id: u32, bin_id: u32, amount: i128) {
        env.events().publish((Symbol::new(&env, "bet"), round_id));
    }
}
