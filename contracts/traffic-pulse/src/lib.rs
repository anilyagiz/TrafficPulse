#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, crypto, ledger, token, Address, BytesN, Env, Symbol, Vec,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Token,
    Round(u32),
    UserBet(u32, u32, Address), // (round_id, bin_id, user_address)
    Commit(u32),
    Claimed(u32, Address), // (round_id, user_address) - track if user already claimed
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Round {
    pub id: u32,
    pub end_time: u64,
    pub total_pool: i128,
    pub bin_totals: Vec<i128>,
    pub finalized: bool,
    pub winning_bin: u32, // 99 means not finalized
}

/// Error codes for better debugging
pub const ERROR_NOT_INITIALIZED: &str = "not_initialized";
pub const ERROR_ALREADY_INITIALIZED: &str = "already_initialized";
pub const ERROR_UNAUTHORIZED: &str = "unauthorized";
pub const ERROR_ROUND_NOT_FOUND: &str = "round_not_found";
pub const ERROR_ROUND_CLOSED: &str = "round_closed";
pub const ERROR_INVALID_BIN: &str = "invalid_bin";
pub const ERROR_INVALID_AMOUNT: &str = "invalid_amount";
pub const ERROR_ALREADY_FINALIZED: &str = "already_finalized";
pub const ERROR_INVALID_SEED: &str = "invalid_seed";
pub const ERROR_NOT_FINALIZED: &str = "not_finalized";
pub const ERROR_NO_WINNING_BET: &str = "no_winning_bet";
pub const ERROR_NO_WINNERS: &str = "no_winners_in_bin";
pub const ERROR_ALREADY_CLAIMED: &str = "already_claimed";

/// Minimum bet amount (in smallest token unit)
pub const MIN_BET_AMOUNT: i128 = 1;

/// Sniping prevention: No bets allowed in the last 3 minutes (180 seconds)
pub const SNIPING_PREVENTION_SECONDS: u64 = 180;

#[contract]
pub struct TrafficPulseContract;

#[contractimpl]
impl TrafficPulseContract {
    /// Initialize the contract with admin address and token address.
    pub fn initialize(env: Env, admin: Address, token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("{}", ERROR_ALREADY_INITIALIZED);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.events()
            .publish((Symbol::new(&env, "initialize"),), (admin, token));
    }

    /// Create a new prediction round.
    /// Admin only. Commit hash is SHA256 of the seed that will be revealed later.
    pub fn create_round(env: Env, id: u32, end_time: u64, commit: BytesN<32>) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect(ERROR_NOT_INITIALIZED);
        admin.require_auth();

        // SECURITY: Ensure end_time is in the future
        let current_time = env.ledger().timestamp();
        if end_time <= current_time {
            panic!("end_time must be in the future");
        }

        let round = Round {
            id,
            end_time,
            total_pool: 0,
            bin_totals: Vec::from_array(&env, [0, 0, 0, 0, 0]),
            finalized: false,
            winning_bin: 99,
        };
        env.storage().persistent().set(&DataKey::Round(id), &round);
        env.storage()
            .persistent()
            .set(&DataKey::Commit(id), &commit);
        
        env.events()
            .publish((Symbol::new(&env, "round_created"), id), end_time);
    }

    /// Place a bet on a traffic bin for a round.
    /// Users must approve the contract to spend their tokens first.
    pub fn place_bet(env: Env, user: Address, round_id: u32, bin_id: u32, amount: i128) {
        user.require_auth();

        // SECURITY: Validate amount
        if amount < MIN_BET_AMOUNT {
            panic!("{}", ERROR_INVALID_AMOUNT);
        }

        // SECURITY: Validate bin
        if bin_id >= 5 {
            panic!("{}", ERROR_INVALID_BIN);
        }

        let mut round: Round = env
            .storage()
            .persistent()
            .get(&DataKey::Round(round_id))
            .expect(ERROR_ROUND_NOT_FOUND);

        let current_time = env.ledger().timestamp();

        // SECURITY: Check if round is closed
        if current_time >= round.end_time {
            panic!("{}", ERROR_ROUND_CLOSED);
        }

        // SECURITY: Sniping prevention - no bets in last 3 minutes
        if current_time >= round.end_time - SNIPING_PREVENTION_SECONDS {
            panic!("betting closed: sniping prevention active");
        }

        // Transfer tokens from user to contract
        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .expect(ERROR_NOT_INITIALIZED);
        let client = token::Client::new(&env, &token_addr);
        client.transfer(&user, &env.current_contract_address(), &amount);

        // Update round totals
        let mut bin_totals = round.bin_totals;
        let current_bin_total = bin_totals.get(bin_id).unwrap();
        bin_totals.set(bin_id, current_bin_total + amount);

        round.bin_totals = bin_totals;
        round.total_pool += amount;

        env.storage()
            .persistent()
            .set(&DataKey::Round(round_id), &round);

        // Track user's bet
        let user_bet_key = DataKey::UserBet(round_id, bin_id, user.clone());
        let mut user_bet: i128 = env.storage().persistent().get(&user_bet_key).unwrap_or(0);
        user_bet += amount;
        env.storage().persistent().set(&user_bet_key, &user_bet);

        env.events()
            .publish((Symbol::new(&env, "bet"), round_id, user), (bin_id, amount));
    }

    /// Finalize a round by revealing the seed.
    /// Admin only. The seed must hash to the committed value.
    pub fn finalize_round(env: Env, round_id: u32, seed: BytesN<32>) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect(ERROR_NOT_INITIALIZED);
        admin.require_auth();

        let mut round: Round = env
            .storage()
            .persistent()
            .get(&DataKey::Round(round_id))
            .expect(ERROR_ROUND_NOT_FOUND);
        
        if round.finalized {
            panic!("{}", ERROR_ALREADY_FINALIZED);
        }

        // Verify commit-reveal
        let commit: BytesN<32> = env
            .storage()
            .persistent()
            .get(&DataKey::Commit(round_id))
            .unwrap();
        if env.crypto().sha256(&seed.clone().into()) != commit {
            panic!("{}", ERROR_INVALID_SEED);
        }

        // Determine winning bin from seed
        // Use more bytes for better randomness distribution
        let bytes: [u8; 32] = seed.into();
        let winning_bin = ((bytes[0] as u32 + (bytes[1] as u32) * 256 + (bytes[2] as u32) * 65536) % 5) as u32;

        round.finalized = true;
        round.winning_bin = winning_bin;

        env.storage()
            .persistent()
            .set(&DataKey::Round(round_id), &round);
        
        env.events()
            .publish((Symbol::new(&env, "finalized"), round_id), winning_bin);
    }

    /// Claim winnings from a finalized round.
    /// Users can only claim once per round.
    pub fn claim(env: Env, user: Address, round_id: u32) {
        user.require_auth();

        // SECURITY: Check if already claimed
        let claimed_key = DataKey::Claimed(round_id, user.clone());
        if env.storage().persistent().has(&claimed_key) {
            panic!("{}", ERROR_ALREADY_CLAIMED);
        }

        let round: Round = env
            .storage()
            .persistent()
            .get(&DataKey::Round(round_id))
            .expect(ERROR_ROUND_NOT_FOUND);
        
        if !round.finalized {
            panic!("{}", ERROR_NOT_FINALIZED);
        }

        let user_bet_key = DataKey::UserBet(round_id, round.winning_bin, user.clone());
        let user_bet: i128 = env
            .storage()
            .persistent()
            .get(&user_bet_key)
            .expect(ERROR_NO_WINNING_BET);

        let winning_bin_total = round.bin_totals.get(round.winning_bin).unwrap();

        // SECURITY: Prevent division by zero
        if winning_bin_total == 0 {
            panic!("{}", ERROR_NO_WINNERS);
        }

        // Calculate payout with 3% fee
        // net_pool = total_pool * 97 / 100
        let net_pool = (round.total_pool * 97) / 100;
        
        // payout = user_bet * net_pool / winning_bin_total
        let payout = (user_bet * net_pool) / winning_bin_total;

        // SECURITY: Ensure payout is at least the user's bet (protection against rounding issues)
        let min_payout = user_bet;
        let final_payout = if payout < min_payout { min_payout } else { payout };

        // Transfer winnings
        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .expect(ERROR_NOT_INITIALIZED);
        let client = token::Client::new(&env, &token_addr);
        client.transfer(&env.current_contract_address(), &user, &final_payout);

        // Mark as claimed
        env.storage().persistent().set(&claimed_key, &true);
        
        // Clean up user bet storage
        env.storage().persistent().remove(&user_bet_key);

        env.events()
            .publish((Symbol::new(&env, "claim"), round_id, user.clone()), final_payout);
    }

    /// Get round data by ID.
    pub fn get_round(env: Env, id: u32) -> Option<Round> {
        env.storage().persistent().get(&DataKey::Round(id))
    }

    /// Get a user's bet for a specific round and bin.
    pub fn get_user_bet(env: Env, round_id: u32, bin_id: u32, user: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::UserBet(round_id, bin_id, user))
            .unwrap_or(0)
    }

    /// Check if a user has claimed their winnings for a round.
    pub fn has_claimed(env: Env, round_id: u32, user: Address) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Claimed(round_id, user))
    }

    /// Get the admin address.
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Admin)
    }

    /// Get the token address.
    pub fn get_token(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Token)
    }
}