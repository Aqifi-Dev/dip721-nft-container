#[macro_use]
extern crate ic_cdk_macros;
#[macro_use]
extern crate serde;

//use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::HashSet;
use std::result::Result as StdResult;

use candid::{CandidType, Principal};
use ic_cdk::{
    api,
    export::candid::{self, candid_method},
};

thread_local! {
  static STATE: RefCell<State> = RefCell::default();
}
#[derive(CandidType, Deserialize, Default)]
struct State {
    custodians: HashSet<Principal>,
    name: String,
    price: u64,
}
#[derive(CandidType, Deserialize)]
struct InitArgs {
    custodians: Option<HashSet<Principal>>,
    name: String,
    price: u64,
}

#[init]
#[candid_method(init)]
fn init(args: InitArgs) {
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        state.custodians = args
            .custodians
            .unwrap_or_else(|| HashSet::from_iter([api::caller()]));
        state.name = args.name;
        state.price = args.price;
    });
}
#[query()]
#[candid_method(query)]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}
#[query()]
#[candid_method(query)]
fn get_name() -> String {
    STATE.with(|state| state.borrow().name.clone())
}
#[query()]
#[candid_method(query)]
fn get_price() -> u64 {
    STATE.with(|state| state.borrow().price.clone())
}

#[derive(CandidType, Deserialize)]
enum Error {
    Unauthorized,
    InvalidTokenId,
    ZeroAddress,
    Other,
    ZeroValue,
    EmptyString,
}
type Result<T = u64, E = Error> = StdResult<T, E>;

#[update]
#[candid_method(update)]
fn set_name(name: String) -> Result<u64, Error> {
    if name.is_empty() {
        Err(Error::EmptyString)
    } else {
        STATE.with(|state| {
            let mut state = state.borrow_mut();
            state.name = name;
            Ok(0)
        })
    }
    /*if state.custodians.contains(&api::caller()) { } else { Err(Error::Unauthorized)}*/
}
#[update]
#[candid_method(update)]
fn set_price(price: u64) -> Result<u64, Error> {
    if price == 0 {
        Err(Error::ZeroValue)
    } else {
        STATE.with(|state| {
            let mut state = state.borrow_mut();
            state.price = price;
            Ok(0)
        })
    }
    /*if state.custodians.contains(&api::caller()) { } else { Err(Error::Unauthorized)}*/
}
