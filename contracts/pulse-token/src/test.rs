#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_token_metadata() {
    let env = Env::default();
    let contract_id = env.register_contract(None, PulseToken);
    let client = PulseTokenClient::new(&env, &contract_id);

    assert_eq!(client.name(), "PULSE");
    assert_eq!(client.symbol(), "PLS");
    assert_eq!(client.decimals(), 18);
}

#[test]
fn test_mint_and_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PulseToken);
    let client = PulseTokenClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    client.mint(&user, &1000);

    assert_eq!(client.balance(&user), 1000);
}

#[test]
fn test_transfer() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PulseToken);
    let client = PulseTokenClient::new(&env, &contract_id);

    let from = Address::generate(&env);
    let to = Address::generate(&env);

    client.mint(&from, &1000);

    let success = client.transfer(&from, &to, &100);
    assert!(success);

    assert_eq!(client.balance(&from), 900);
    assert_eq!(client.balance(&to), 100);
}

#[test]
fn test_insufficient_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PulseToken);
    let client = PulseTokenClient::new(&env, &contract_id);

    let from = Address::generate(&env);
    let to = Address::generate(&env);

    let success = client.transfer(&from, &to, &100);
    assert!(!success);
}

#[test]
fn test_approve_and_allowance() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PulseToken);
    let client = PulseTokenClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let spender = Address::generate(&env);

    client.approve(&owner, &spender, &500);

    assert_eq!(client.allowance(&owner, &spender), 500);
}
