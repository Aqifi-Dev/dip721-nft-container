# DIP721 NFT Container

## Summary

- npm run once: run this once for setting up admin, john, alice, bob identities. admin acts as the admin. john actis as a hacker. alice and bob acti as normal users.

[Note] adding node_compatibility in dfx.json WILL disable the hello_frontend in the building process!

- npm run d01: check Rust code
- npm run d02: use admin identity. This is MUST!
- npm run d0: start dfx environment
- npm run d1: deploy hello canister
- npm run d2: deploy dip721_nft_container canister
- npm run d3: deploy hello_frontend canister
  ... in the browser, press F12 to open the console
- npm run d4: call some simple hello and dip721 canister functions
- npm run d5: call dip721 canister function, which will call hello get_price function for inter-canister calls
- npm run d6: use admin identity to mint one NFT
- npm run d6g: get metadata of NFT id = 0
- npm run d6s: use admin identity to set NFT id = 0 metadata
- npm run d6a: use john identity to mint one NFT
- npm run d6ag: get metadata of NFT id = 1

Optional tests:

- npm run d7: get balances of admin, alice, bob
- npm run d8: transfer one NFT from admin to Alice
- npm run d9: approveDip721, setApprovalForAllDip721

- npm run d12 : call a NodeJs script to invoke minting
- npm run dstop : terminate the local dfx environment

## UI Explanation

The "Get NFT Metadata" button takes "Enter NFT_ID" input field, and try to find the metadata for that id, assuming that id exists.

The "Show NFT balances at address" button takes the address and metadata input fields above it to mint a new NFT to that address(or principal identifier)

## Conclusions

Conclusion1: dfinity does not have good or updated support for Rust code, so it cannot auto generate DID files, which are required to generate JavaScript interface files for NodeJs script. That is causing minting from NodeJs difficult.

Conclusion2: I could not use the seed phrases generated from dfx command tool to generate the same identity in the JavaScript. Not sure what is going on... So security tests cannot be performed as the JavaScript library cannot use the same identity that CLI has generated.

## Setup / Installation

- Git
- [DFX] version 0.12.1
- [Rust] version 1.67.0
- [Rust WASM module]:
  `rustup target add wasm32-unknown-unknown`
- [cargo audit]
  `cargo install cargo-audit`
- [NodeJs] version 18.13.0
- [Linux] Ubuntu derivatives are required to run some bash commands

## Running Locally

Run the following commands to download and set up the project:

```sh
git clone git@github.com:AuroraLantean/internet_computer_nft.git dip721-nft-container
cd dip721-nft-container
dfx help
dfx canister --help
```

## Update the project Cargo.toml

Add the new canister into the Cargo.toml at the project root

```
[workspace]
members = [
    "src/dip721_nft_container",
    "src/hello",
]
```

## Update dfx.json

Include all the canisters you want to deploy in the dfx.json file. Remember to add canister `rust` type if it is written in Rust

## Check Rust canister code

```sh
cargo check
```

## Install frontend dependencies

```
npm install
```

## Start the dfinity network:

```sh
dfx start --background --clean
```

## Create canisters

This is optional. `dfx deploy` will include this.
To creates the .dfx/local directory and adds the canister_ids.json file to that directory:

```sh
dfx canister create --all
```

Or if you just want to create one canister:
`dfx canister create dip721_nft_container`

## Update the DID file for each canister

Currently, dfx cannot automatically generate DID files for Rust canisters. So you have to manually write each DID file for each Rust canisters. Then when you run `dfx deploy you_canister_name`, the JavaScript interface file for that canister will be automatically generated.

### Deploy Hello canister

```sh
  dfx deploy hello --no-wallet --argument \
  "(record {
      name = \"Hello Canister Name\";
      price = 174;
      custodians = opt vec { principal \"$(dfx identity get-principal)\" };
  })"
  dfx generate hello
```

### Deploy Hello_Frontend canister

```sh
  dfx deploy hello_frontend
```

### Deploy dip721_nft_container canister

```sh
  dfx deploy dip721_nft_container --no-wallet --argument \
  "(record {
      name = \"Gold\";
      symbol = \"GLD\";
      logo = opt record {
          data = \"$(base64 -i ./logo.png)\";
          logo_type = \"image/png\";
      };
      custodians = opt vec { principal \"$(dfx identity get-principal)\" };
  })"
  dfx generate dip721_nft_container
```

The canister expects a record parameter with the following fields:

- `custodians`: A list of users allowed to manage the canister. If unset, it will default to the caller. If you're using `dfx`, and haven't specified `--no-wallet`, that's your wallet principal, not your own, so be careful!
- `name`: The name of your NFT collection. Required.
- `symbol`: A short slug identifying your NFT collection. Required.
- `logo`: The logo of your NFT collection, represented as a record with fields `data` (the base-64 encoded logo) and `logo_type` (the MIME type of the logo file). If unset, it will default to the Internet Computer logo.

Remove `"type": "module",` in package.json

to deploy without logo:

```sh
dfx deploy --no-wallet --argument \
"(record {
    name = \"Gold\";
    symbol = \"GLD\";
    logo = null;
    custodians = opt vec { principal \"$(dfx identity get-principal)\" };
})"
```

## Make declaration files

if you change any canister function input and/or output, OR add/delete any canister function, OR add new canister, you must update the dip721-nft-container.did file and/or other canister did files manually.
Currently, dfx generate supports four languages: Motoko, Candid, JavaScript, and TypeScript.

To generate the declaration files.

```
dfx generate dip721_nft_container
dfx generate hello
dfx generate hello_frontend
```

### To Test the canister via Bash

```sh
dfx canister id dip721_nft_container
```

Confirm the result is the same as the one at .dft/local/canister_ids.json

```sh
Function names are inside the query macros
dfx canister call dip721_nft_container nameDip721 '()'
dfx canister call dip721_nft_container symbolDip721 '()'
dfx canister call dip721_nft_container totalSupplyDip721 '()'
dfx canister call dip721_nft_container logoDip721 '()'

dfx canister call dip721_nft_container set_name '("Silver")'
dfx canister call dip721_nft_container set_symbol '("SLV")'
```

The old method arguments:

```rust
enum MetadataPurpose {
    Preview,
    Rendered,
}
struct MetadataPart {
    purpose: MetadataPurpose,
    key_val_data: HashMap<String, MetadataVal>,
    data: Vec<u8>,
}
type MetadataDesc = Vec<MetadataPart>;
fn mint(
    to: Principal,
    metadata: MetadataDesc,
    blob_content: Vec<u8>,
    ){}
```

How to make argument in shell:

```sh
dfx identity new alice --disable-encryption || true
dfx identity new bob --disable-encryption || true
YOU=$(dfx identity get-principal)
ALICE=$(dfx --identity alice identity get-principal)
BOB=$(dfx --identity bob identity get-principal)
echo '(*) Creating NFT with metadata "hello":'
dfx canister call dip721_nft_container mintDip721 \
    "(principal\"$YOU\",vec{record{
        purpose=variant{Rendered};
        data=blob\"hello\";
        key_val_data=vec{
            record{
                \"contentType\";
                variant{TextContent=\"text/plain\"};
            };
            record{
                \"locationType\";
                variant{Nat8Content=4:nat8}
            };
        }
    }},blob\"hello\")"
echo '(*) Metadata of the newly created NFT:'
```

```sh
dfx canister call dip721_nft_container getMetadataDip721 '(0:nat64)'
echo "(*) Owner of NFT 0 (you are $YOU):"
dfx canister call dip721_nft_container ownerOfDip721 '(0:nat64)'
echo '(*) Number of NFTs you own:'
dfx canister call dip721_nft_container balanceOfDip721 "(principal\"$YOU\")"
echo '(*) Number of NFTs Alice owns:'
dfx canister call dip721_nft_container balanceOfDip721 "(principal\"$ALICE\")"
echo '(*) Total NFTs in existence:'
dfx canister call dip721_nft_container totalSupplyDip721
echo '(*) Transferring the NFT from you to Alice:'
dfx canister call dip721_nft_container transferFromDip721 "(principal\"$YOU\",principal\"$ALICE\",0:nat64)"
echo "(*) Owner of NFT 0 (Alice is $ALICE):"
dfx canister call dip721_nft_container ownerOfDip721 '(0:nat64)'
echo '(*) Number of NFTs you own:'
dfx canister call dip721_nft_container balanceOfDip721 "(principal\"$YOU\")"
echo '(*) Number of NFTs Alice owns:'
dfx canister call dip721_nft_container balanceOfDip721 "(principal\"$ALICE\")"
echo '(*) Alice approves Bob to transfer NFT 0 for her:'
dfx --identity alice canister call dip721_nft_container approveDip721 "(principal\"$BOB\",0:nat64)"
echo '(*) Bob transfers NFT 0 to himself:'
dfx --identity bob canister call dip721_nft_container transferFromDip721 "(principal\"$ALICE\",principal\"$BOB\",0:nat64)"
echo "(*) Owner of NFT 0 (Bob is $BOB):"
dfx canister call dip721_nft_container ownerOfDip721 '(0:nat64)'
echo '(*) Bob approves Alice to operate on any of his NFTs:'
dfx --identity bob canister call dip721_nft_container setApprovalForAllDip721 "(principal\"$ALICE\",true)"
echo '(*) Alice transfers 0 to herself:'
dfx --identity alice canister call dip721_nft_container transferFromDip721 "(principal\"$BOB\",principal\"$ALICE\",0:nat64)"
echo '(*) You are a custodian, so you can transfer the NFT back to yourself without approval:'
dfx canister call dip721_nft_container transferFromDip721 "(principal\"$ALICE\",principal\"$YOU\",0:nat64)"


//dfx canister call dip721_nft_container safeTransferFromDip721 '("$(dfx identity get-principal)",principle "zzz-aaa...",1)'

//dfx canister call dip721_nft_container set_logo '("xyz...")'
//dfx canister call dip721_nft_container set_custodian '("xyz...")'
//dfx canister call dip721_nft_container is_custodian '("xyz...")'

dfx identity list
dfx identity use xyz
dfx identity get-principal


```

### To test the canister via NodeJs

Add `"type": "module",` in package.json
Run in bash: `node --es-module-specifier-resolution=node src/node/index.js`

### Public IC Deployment

in the root directory for your project

```
dfx ping ic
```

you should see output similar to the following:

```
{
"ic_api_version": "0.18.0" "impl_hash": "d639545e0f38e075ad240fd4ec45d4eeeb11e1f67a52cdd449cd664d825e7fec" "impl_version": "8dc1a28b4fb9605558c03121811c9af9701a6142" "replica_health_status": "healthy" "root_key": [48, 129, 130, 48, 29, 6, 13, 43, 6, 1, 4, 1, 130, 220, 124, 5, 3, 1, 2, 1, 6, 12, 43, 6, 1, 4, 1, 130, 220, 124, 5, 3, 2, 1, 3, 97, 0, 129, 76, 14, 110, 199, 31, 171, 88, 59, 8, 189, 129, 55, 60, 37, 92, 60, 55, 27, 46, 132, 134, 60, 152, 164, 241, 224, 139, 116, 35, 93, 20, 251, 93, 156, 12, 213, 70, 217, 104, 95, 145, 58, 12, 11, 44, 197, 52, 21, 131, 191, 75, 67, 146, 228, 103, 219, 150, 214, 91, 155, 180, 203, 113, 113, 18, 248, 71, 46, 13, 90, 77, 20, 80, 95, 253, 116, 132, 176, 18, 145, 9, 28, 95, 135, 185, 136, 131, 70, 63, 152, 9, 26, 11, 170, 174]
}
```

## Interface

Aside from the standard functions, it has five extra functions:

- `set_name`, `set_symbol`, `set_logo`, and `set_custodian`: Update the collection information of the corresponding field from when it was initialized.
- `is_custodian`: Checks whether the specified user is a custodian.

The canister also supports a certified HTTP interface; going to `/<nft>/<id>` will return `nft`'s metadata file #`id`, with `/<nft>` returning the first non-preview file.

Remember that query functions are uncertified; the result of functions like `ownerOfDip721` can be modified arbitrarily by a single malicious node. If queried information is depended on, for example if someone might send ICP to the owner of a particular NFT to buy it from them, those calls should be performed as update calls instead. You can force an update call by passing the `--update` flag to `dfx` or using the `Agent::update` function in `agent-rs`.

## End

```sh
dfx stop
```

## Demo

This example comes with a demo script, `demo.sh`, which runs through an example workflow with minting and trading an NFT between a few users. Meant primarily to be read rather than run, you can use it to see how basic NFT operations are done. For a more in-depth explanation, read the [standard][dip721].

[dfx]: https://smartcontracts.org/docs/developers-guide/install-upgrade-remove.html
[rust]: https://rustup.rs
[dip721]: https://github.com/Psychedelic/DIP721
[mint]: https://github.com/dfinity/experimental-minting-tool

## Security Considerations and Security Best Practices

If you base your application on this example, we recommend you familiarize yourself with and adhere to the [Security Best Practices](https://internetcomputer.org/docs/current/references/security/) for developing on the Internet Computer. This example may not implement all the best practices.

For example, the following aspects are particularly relevant for this app:

- [Inter-Canister Calls and Rollbacks](https://internetcomputer.org/docs/current/references/security/rust-canister-development-security-best-practices/#inter-canister-calls-and-rollbacks), since issues around inter-canister calls can e.g. lead to time-of-check time-of-use or double spending security bugs.
- [Certify query responses if they are relevant for security](https://internetcomputer.org/docs/current/references/security/general-security-best-practices#certify-query-responses-if-they-are-relevant-for-security), since this is essential when e.g. displaying important NFT data in the frontend that may be used by users to decide on future transactions.
- [Use a decentralized governance system like SNS to make a canister have a decentralized controller](https://internetcomputer.org/docs/current/references/security/rust-canister-development-security-best-practices#use-a-decentralized-governance-system-like-sns-to-make-a-canister-have-a-decentralized-controller), since decentralizing control is a fundamental aspect when dealing with NFTs.
