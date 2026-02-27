#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    vec, Bytes, BytesN, Env,
};

// Helper to create a test environment
fn create_test_env() -> Env {
    let env = Env::default();
    env.mock_all_auths();
    env
}

// Helper to create a commit hash from seed
fn create_commit(env: &Env, seed: &[u8; 32]) -> BytesN<32> {
    env.crypto().sha256(&Bytes::from_array(env, seed))
}

#[test]
fn test_initialize() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token = Address::generate(&env);

    client.initialize(&admin, &token);

    // Verify admin was set
    let stored_admin = client.get_admin();
    assert_eq!(stored_admin, Some(admin.clone()));

    // Verify token was set
    let stored_token = client.get_token();
    assert_eq!(stored_token, Some(token));
}

#[test]
#[should_panic(expected = "already_initialized")]
fn test_initialize_twice_panics() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token = Address::generate(&env);

    client.initialize(&admin, &token);
    client.initialize(&admin, &token); // Should panic
}

#[test]
fn test_create_round() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token = Address::generate(&env);
    client.initialize(&admin, &token);

    let seed: [u8; 32] = [1u8; 32];
    let commit = create_commit(&env, &seed);
    let end_time = env.ledger().timestamp() + 600; // 10 minutes from now

    client.create_round(&1u32, &end_time, &commit);

    let round = client.get_round(&1u32);
    assert!(round.is_some());
    let round = round.unwrap();
    assert_eq!(round.id, 1u32);
    assert_eq!(round.end_time, end_time);
    assert_eq!(round.total_pool, 0i128);
    assert_eq!(round.bin_totals, vec![&env, 0i128, 0, 0, 0, 0]);
    assert!(!round.finalized);
    assert_eq!(round.winning_bin, 99u32);
}

#[test]
fn test_place_bet() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    
    // Create a mock token contract
    let token_id = env.register(pulse_token::PulseToken, ());
    let token_client = pulse_token::Client::new(&env, &token_id);
    
    // Initialize token and mint to user
    pulse_token::Client::new(&env, &token_id).initialize(&admin);
    pulse_token::Client::new(&env, &token_id).mint(&admin, &user, &1000i128);

    client.initialize(&admin, &token_id);

    // Create a round
    let seed: [u8; 32] = [1u8; 32];
    let commit = create_commit(&env, &seed);
    let end_time = env.ledger().timestamp() + 600;
    client.create_round(&1u32, &end_time, &commit);

    // User approves contract to spend tokens
    token_client.approve(&user, &contract_id, &100i128);

    // Place bet
    client.place_bet(&user, &1u32, &2u32, &100i128); // Bin 2 (41-60)

    // Verify round state
    let round = client.get_round(&1u32).unwrap();
    assert_eq!(round.total_pool, 100i128);
    assert_eq!(round.bin_totals.get(2).unwrap(), 100i128);

    // Verify user bet
    let user_bet = client.get_user_bet(&1u32, &2u32, &user);
    assert_eq!(user_bet, 100i128);
}

#[test]
#[should_panic(expected = "invalid_bin")]
fn test_place_bet_invalid_bin_panics() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token_id = env.register(pulse_token::PulseToken, ());
    
    client.initialize(&admin, &token_id);

    let seed: [u8; 32] = [1u8; 32];
    let commit = create_commit(&env, &seed);
    let end_time = env.ledger().timestamp() + 600;
    client.create_round(&1u32, &end_time, &commit);

    // Try to bet on invalid bin (5 is out of range)
    client.place_bet(&user, &1u32, &5u32, &100i128);
}

#[test]
#[should_panic(expected = "invalid_amount")]
fn test_place_bet_zero_amount_panics() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token_id = env.register(pulse_token::PulseToken, ());
    
    client.initialize(&admin, &token_id);

    let seed: [u8; 32] = [1u8; 32];
    let commit = create_commit(&env, &seed);
    let end_time = env.ledger().timestamp() + 600;
    client.create_round(&1u32, &end_time, &commit);

    // Try to bet 0
    client.place_bet(&user, &1u32, &2u32, &0i128);
}

#[test]
#[should_panic(expected = "round_closed")]
fn test_place_bet_after_round_closed_panics() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token_id = env.register(pulse_token::PulseToken, ());
    
    client.initialize(&admin, &token_id);

    // Create a round that's already ended
    let seed: [u8; 32] = [1u8; 32];
    let commit = create_commit(&env, &seed);
    let end_time = env.ledger().timestamp() + 600;
    client.create_round(&1u32, &end_time, &commit);

    // Move time past end_time
    env.ledger().set_timestamp(end_time + 1);

    // Try to place bet
    client.place_bet(&user, &1u32, &2u32, &100i128);
}

#[test]
fn test_finalize_round() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token = Address::generate(&env);
    client.initialize(&admin, &token);

    let seed: [u8; 32] = [42u8; 32];
    let commit = create_commit(&env, &seed);
    let end_time = env.ledger().timestamp() + 600;
    client.create_round(&1u32, &end_time, &commit);

    // Finalize with correct seed
    let seed_bytes = BytesN::from_array(&env, &seed);
    client.finalize_round(&1u32, &seed_bytes);

    let round = client.get_round(&1u32).unwrap();
    assert!(round.finalized);
    // winning_bin should be determined from seed
    assert!(round.winning_bin < 5);
}

#[test]
#[should_panic(expected = "invalid_seed")]
fn test_finalize_with_wrong_seed_panics() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token = Address::generate(&env);
    client.initialize(&admin, &token);

    let seed: [u8; 32] = [42u8; 32];
    let commit = create_commit(&env, &seed);
    let end_time = env.ledger().timestamp() + 600;
    client.create_round(&1u32, &end_time, &commit);

    // Try to finalize with wrong seed
    let wrong_seed: [u8; 32] = [99u8; 32];
    let wrong_seed_bytes = BytesN::from_array(&env, &wrong_seed);
    client.finalize_round(&1u32, &wrong_seed_bytes);
}

#[test]
#[should_panic(expected = "already_finalized")]
fn test_finalize_twice_panics() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token = Address::generate(&env);
    client.initialize(&admin, &token);

    let seed: [u8; 32] = [42u8; 32];
    let commit = create_commit(&env, &seed);
    let end_time = env.ledger().timestamp() + 600;
    client.create_round(&1u32, &end_time, &commit);

    let seed_bytes = BytesN::from_array(&env, &seed);
    client.finalize_round(&1u32, &seed_bytes);
    client.finalize_round(&1u32, &seed_bytes); // Should panic
}

#[test]
#[should_panic(expected = "not_finalized")]
fn test_claim_before_finalized_panics() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token_id = env.register(pulse_token::PulseToken, ());
    
    client.initialize(&admin, &token_id);

    let seed: [u8; 32] = [1u8; 32];
    let commit = create_commit(&env, &seed);
    let end_time = env.ledger().timestamp() + 600;
    client.create_round(&1u32, &end_time, &commit);

    // Try to claim before finalized
    client.claim(&user, &1u32);
}

#[test]
#[should_panic(expected = "no_winning_bet")]
fn test_claim_without_bet_panics() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    client.initialize(&admin, &token);

    let seed: [u8; 32] = [42u8; 32];
    let commit = create_commit(&env, &seed);
    let end_time = env.ledger().timestamp() + 600;
    client.create_round(&1u32, &end_time, &commit);

    let seed_bytes = BytesN::from_array(&env, &seed);
    client.finalize_round(&1u32, &seed_bytes);

    // User didn't bet, should panic
    client.claim(&user, &1u32);
}

#[test]
fn test_has_claimed() {
    let env = create_test_env();
    let contract_id = env.register(TrafficPulseContract, ());
    let client = TrafficPulseContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    client.initialize(&admin, &token);

    let seed: [u8; 32] = [42u8; 32];
    let commit = create_commit(&env, &seed);
    let end_time = env.ledger().timestamp() + 600;
    client.create_round(&1u32, &end_time, &commit);

    // Initially not claimed
    assert!(!client.has_claimed(&1u32, &user));
}

// Mock pulse_token module for testing
mod pulse_token {
    use soroban_sdk::{contract, contractimpl, Address, Env};

    #[contract]
    pub struct PulseToken;

    #[contractimpl]
    impl PulseToken {
        pub fn initialize(env: Env, admin: Address) {}
        pub fn mint(env: Env, admin: Address, to: Address, amount: i128) {}
        pub fn approve(env: Env, owner: Address, spender: Address, amount: i128) {}
    }

    pub struct Client<'a> {
        env: &'a Env,
        id: &'a soroban_sdk::Address,
    }

    impl<'a> Client<'a> {
        pub fn new(env: &'a Env, id: &'a soroban_sdk::Address) -> Self {
            Self { env, id }
        }

        pub fn initialize(&self, admin: &Address) {
            soroban_sdk::invoke_contract(
                self.env,
                self.id,
                &soroban_sdk::Symbol::new(self.env, "initialize"),
                soroban_sdk::vec![self.env, admin],
            );
        }

        pub fn mint(&self, admin: &Address, to: &Address, amount: &i128) {
            soroban_sdk::invoke_contract(
                self.env,
                self.id,
                &soroban_sdk::Symbol::new(self.env, "mint"),
                soroban_sdk::vec![self.env, admin, to, amount],
            );
        }

        pub fn approve(&self, owner: &Address, spender: &Address, amount: &i128) {
            soroban_sdk::invoke_contract(
                self.env,
                self.id,
                &soroban_sdk::Symbol::new(self.env, "approve"),
                soroban_sdk::vec![self.env, owner, spender, amount],
            );
        }
    }
}
