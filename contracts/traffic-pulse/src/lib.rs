#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, ledger, token, Address, Env, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Token,
    Round(u32),
    UserBet(u32, Address), // (round_id, user_address)
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Round {
    pub id: u32,
    pub end_time: u64,
    pub total_pool: i128,
    pub bin_totals: Vec<i128>,
    pub finalized: bool,
}

#[contract]
pub struct TrafficPulseContract;

#[contractimpl]
impl TrafficPulseContract {
    pub fn initialize(env: Env, admin: Address, token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
    }

    pub fn create_round(env: Env, id: u32, end_time: u64) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let round = Round {
            id,
            end_time,
            total_pool: 0,
            bin_totals: Vec::from_array(&env, [0, 0, 0, 0, 0]),
            finalized: false,
        };
        env.storage().persistent().set(&DataKey::Round(id), &round);
    }

    pub fn place_bet(env: Env, user: Address, round_id: u32, bin_id: u32, amount: i128) {
        user.require_auth();

        let mut round: Round = env
            .storage()
            .persistent()
            .get(&DataKey::Round(round_id))
            .expect("round not found");

        if env.ledger().timestamp() >= round.end_time {
            panic!("round closed");
        }
        if bin_id >= 5 {
            panic!("invalid bin");
        }

        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let client = token::Client::new(&env, &token_addr);
        client.transfer(&user, &env.current_contract_address(), &amount);

        let mut bin_totals = round.bin_totals;
        let current_bin_total = bin_totals.get(bin_id).unwrap();
        bin_totals.set(bin_id, current_bin_total + amount);

        round.bin_totals = bin_totals;
        round.total_pool += amount;

        env.storage()
            .persistent()
            .set(&DataKey::Round(round_id), &round);

        let user_bet_key = DataKey::UserBet(round_id, user.clone());
        let mut user_bet: i128 = env.storage().persistent().get(&user_bet_key).unwrap_or(0);
        user_bet += amount;
        env.storage().persistent().set(&user_bet_key, &user_bet);

        env.events()
            .publish((Symbol::new(&env, "bet"), round_id, user), (bin_id, amount));
    }

    pub fn get_round(env: Env, id: u32) -> Option<Round> {
        env.storage().persistent().get(&DataKey::Round(id))
    }

    pub fn get_user_bet(env: Env, round_id: u32, user: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::UserBet(round_id, user))
            .unwrap_or(0)
    }
}
