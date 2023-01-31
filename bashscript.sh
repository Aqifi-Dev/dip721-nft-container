#!/bin/bash
# ./bashscript.sh p1
echo -e "Running bashscript.sh ..."
echo -e "options: $1 $2";

cd ../dip721-nft-container
pwd
if [[ $1 == "once" ]]; then
  echo 'once'
  echo 'install wasm32'
  rustup target add wasm32-unknown-unknown

  echo 'install cargo-audit'
  cargo install cargo-audit

  echo 'setup admin'
  dfx identity new admin --force --disable-encryption || true
  dfx identity use admin
  dfx identity get-principal

  echo 'setup alice'
  dfx identity new alice --disable-encryption || true
  dfx identity use alice
  dfx identity get-principal

  echo 'setup bob'
  dfx identity new bob --disable-encryption || true
  dfx identity use bob
  dfx identity get-principal

  echo 'setup john'
  dfx identity new john --disable-encryption || true
  dfx identity use john
  dfx identity get-principal

  echo 'install npm dependencies'
  npm install

elif [[ $1 == "test" ]]; then
  echo 'test: bashscript test'

elif [[ $1 == "dfxstop" ]]; then
  echo 'dfxstop: dfx stop'
  dfx stop

elif [[ $1 == "cargocheck" ]]; then
  echo 'cargocheck: cargo check'
  cargo check

elif [[ $1 == "useDfxAdmin" ]]; then
  echo 'useDfxAdmin...'
  dfx identity use admin
  echo 'admin principal'
  dfx identity get-principal

elif [[ $1 == "startDfx" ]]; then
  echo 'startDfx: cargo check then start dfx, network = ' $2
  # dfx ping local ||
  dfx start --background --clean
  #sleep 2s
  # dfx deploy command will register, build, and deploy a dapp on the local canister execution environment, on the IC or on a specified testnet.
  #dfx canister create --all
  #dfx canister create dip721_nft_container
  #dfx canister create hello
  #dfx canister create hello_frontend
  dfx identity use admin
  admin=$(dfx identity get-principal)
  echo 'using admin:' $admin

elif [[ $1 == "deployHello" ]]; then
  echo '1: to deploy hello, network = ' $2
  dfx deploy hello --no-wallet --network $2 --argument \
  "(record {
      name = \"Hello Canister Name\";
      price = 174;
      custodians = opt vec { principal \"$(dfx identity get-principal)\" };
  })"
  echo 'hello has been deployed'
  dfx canister id hello --network $2
  hello_id=$(dfx canister id hello)
  echo 'hello_id:' $hello_id
  echo ''
  echo 'generate hello declaration files'
  dfx generate hello
  #dfx generate will generate DID files, too, if it is done in Motoko

elif [[ $1 == "deployDip721" ]]; then
  echo '2: to deploy dip721_nft_container, network = ' $2
  dfx deploy dip721_nft_container --no-wallet --network $2 --argument \
  "(record {
      name = \"Gold\";
      symbol = \"GLD\";
      logo = opt record {
          data = \"$(base64 -i ./logo.png)\";
          logo_type = \"image/png\";
      };
      custodians = opt vec { principal \"$(dfx identity get-principal)\" };
  })"
  echo 'dip721_nft_container has been deployed'
  dfx canister id dip721_nft_container --network $2
  dip721_nft_container_id=$(dfx canister id dip721_nft_container)
  echo 'dip721_nft_container_id:' $dip721_nft_container_id
  echo ''
  echo 'generate dip721_nft_container declaration files'
  dfx generate dip721_nft_container

elif [[ $1 == "deployDip721a" ]]; then
  echo '2a to re-deploy dip721_nft_container, network = ' $2
  dfx canister install dip721_nft_container --network $2 --mode reinstall --argument \
  "(record {
      name = \"Gold\";
      symbol = \"GLD\";
      logo = opt record {
          data = \"$(base64 -i ./logo.png)\";
          logo_type = \"image/png\";
      };
      custodians = opt vec { principal \"$(dfx identity get-principal)\" };
  })"
  echo 'dip721_nft_container has been deployed'
  dfx canister id dip721_nft_container --network $2
  dip721_nft_container_id=$(dfx canister id dip721_nft_container)
  echo 'dip721_nft_container_id:' $dip721_nft_container_id
  echo ''
  echo 'generate dip721_nft_container declaration files'
  dfx generate dip721_nft_container


elif [[ $1 == "deployDip721no_logo" ]]; then
  echo '2no_logo, network = ' $2
  dfx deploy dip721_nft_container --no-wallet --network $2 --argument \
  "(record {
      name = \"Gold\";
      symbol = \"GLD\";
      logo = null;
      custodians = opt vec { principal \"$(dfx identity get-principal)\" };
  })"
  echo 'generate dip721_nft_container declaration files'
  dfx generate dip721_nft_container

elif [[ $1 == "deployHelloFrontend" ]]; then
  echo '3: to deploy hello_frontend, network = ' $2
  dfx deploy hello_frontend --network $2
  #--no-wallet
  echo 'hello_frontend has been deployed'
  echo ''
  echo 'generate hello_frontend declaration files'
  dfx generate hello_frontend

  dfx canister id hello_frontend --network $2
  hello_frontend_id=$(dfx canister id hello_frontend)
  echo 'hello_frontend_id:' $hello_frontend_id
  echo ''
  dfx canister id dip721_nft_container
  dip721_nft_container_id=$(dfx canister id dip721_nft_container)
  echo 'dip721_nft_container_id:' $dip721_nft_container_id
  echo "http://127.0.0.1:4943/?canisterId=${hello_frontend_id}&id=${dip721_nft_container_id}"
  xdg-open "http://127.0.0.1:4943/?canisterId=${hello_frontend_id}&id=${dip721_nft_container_id}"
  echo 'F12 or Ctrl + Shift + I to open the console'

elif [[ $1 == "callSimpleFunctions" ]]; then
  echo '4: call some simple hello and dip721 canister functions, network = ' $2
  dfx canister id dip721_nft_container --network $2
  dip721_id=$(dfx canister id dip721_nft_container)
  echo 'dip721_id:' $dip721_id
  dfx canister call --network $2 dip721_nft_container nameDip721 '()'
  dfx canister call --network $2 dip721_nft_container symbolDip721 '()'
  echo 'totalSupply:'
  dfx canister call --network $2 dip721_nft_container totalSupplyDip721 '()'
  echo 'last nft metadata:'
  dfx canister call --network $2 dip721_nft_container get_metadata_last "()"
  #dfx canister call dip721_nft_container logoDip721 '()'

  dfx canister id --network $2 hello
  hello_id=$(dfx canister id hello)
  echo 'hello_id:' $hello_id
  dfx canister call --network $2 hello greet 'JohnDoe'
  echo 'call hello get_name()'
  dfx canister call --network $2 hello get_name '()'
  echo 'call hello get_price()'
  dfx canister call --network $2 hello get_price '()'

  echo 'call hello set_name()'
  dfx canister call --network $2 hello set_name 'HelloTwo'
  echo 'call hello get_name()'
  dfx canister call --network $2 hello get_name '()'

  echo 'call hello set_price()'
  dfx canister call --network $2 hello set_price '(185:nat64)'
  echo 'call hello get_price()'
  dfx canister call --network $2 hello get_price '()'

elif [[ $1 == "callInterCanister" ]]; then
  echo '5: get_price from dip721 to hello, network = ' $2
  hello_id=$(dfx canister id hello)
  dfx canister call --network $2 dip721_nft_container get_price "(principal\"$hello_id\")"

elif [[ $1 == "mintNFT" ]]; then
  echo -e "option" $1 'metadata:'$2 ', network = ' $3
  echo '6: admin calls mintDip721'
  if [ -z "$2" ]
  then
    echo "metadata is empty"
    exit 0
  else
    echo "metadata is valid"
  fi

  echo 'use admin'
  dfx identity use admin
  admin=$(dfx identity get-principal)
  echo 'admin:' $admin
  echo "(*) Creating NFT with metadata $2:"
  dfx canister call --network $3 dip721_nft_container mintDip721 \
      "(principal\"$admin\",\"$2\")"
  echo '(*) Number of NFTs admin owns:'
  dfx canister call --network $3 dip721_nft_container balanceOfDip721 "(principal\"$admin\")"
  echo "(*) totalSupply:"
  dfx canister call --network $3 dip721_nft_container totalSupplyDip721 '()'
  echo '(*) last Metadata:'
  dfx canister call --network $3 dip721_nft_container get_metadata_last "()"

elif [[ $1 == "getMetadata" ]]; then
  echo -e "option" $1 ', nft_id:'$2 ', network = ' $3
  echo 'get_metadata'
  if [ -z "$2" ]
  then
    echo "nft_id is empty"
    exit 0
  else
    echo "nft_id is valid"
  fi
  dfx canister call --network $3 dip721_nft_container get_metadata_v2 "($2:nat64)"

elif [[ $1 == "setMetadata" ]]; then
  echo '6b: set_metadata' $1 ', nft_id:'$2 ', network = ' $3
  if [ -z "$2" ]
  then
    echo "nft_id is empty"
    exit 0
  else
    echo "nft_id is valid"
  fi
  dfx identity use admin
  admin=$(dfx identity get-principal)
  echo 'admin:' $admin
  echo '(*) Number of NFTs admin owns:'
  dfx canister call --network $3 dip721_nft_container balanceOfDip721 "(principal\"$admin\")"
  echo 'Set Metadata of NFT id: 0'
  dfx canister call --network $3 dip721_nft_container set_metadata "($2:nat64,\"nft_name:Godzilla\")"
  echo 'Metadata of the NFT id: 0'
  dfx canister call --network $3 dip721_nft_container get_metadata_v2 "($2:nat64)"

elif [[ $1 == "mintDip721forall" ]]; then
  echo -e "option" $1 ', metadata:' $2 ', network = ' $3
  echo '6a: john calls mintDip721forall'
  if [ -z "$2" ]
  then
    echo "metadata is empty"
    exit 0
  else
    echo "metadata is valid"
  fi
  dfx identity use john
  echo 'john identity:'
  dfx identity get-principal
  john=$(dfx identity get-principal)

  echo '(*) Creating NFT with metadata "$2":'
  dfx canister call --network $3 dip721_nft_container mintDip721forall \
      "(principal\"$john\",\"$2\")"
  echo '(*) Number of NFTs john owns:'
  dfx canister call --network $3 dip721_nft_container balanceOfDip721 "(principal\"$john\")"
  echo "(*) totalSupply:"
  dfx canister call --network $3 dip721_nft_container totalSupplyDip721 '()'
  echo '(*) last Metadata:'
  dfx canister call --network $3 dip721_nft_container get_metadata_last "()"

elif [[ $1 == "setcycles" ]]; then
  echo $1 ': mint NFT with old method, network = ' $2 ', icp_amount:' $3
  dfx identity use admin
  admin=$(dfx identity get-principal)
  dfx ledger --network ic create-canister $admin --amount $3

elif [[ $1 == "mint_old_method" ]]; then
  echo $1 ': mint NFT with old method, network = ' $2
  dfx identity use admin
  admin=$(dfx identity get-principal)
  ALICE=$(dfx --identity alice identity get-principal)
  BOB=$(dfx --identity bob identity get-principal)
  echo 'admin:' $admin
  ALICE=$(dfx --identity alice identity get-principal)
  BOB=$(dfx --identity bob identity get-principal)
  echo '(*) Creating NFT with metadata "hello":'
  dfx canister call dip721_nft_container mintDip721 \
      "(principal\"$admin\",vec{record{
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
  dfx canister call dip721_nft_container get_metadata_last "()"

elif [[ $1 == "getBalances" ]]; then
  echo $1 ': get balances of admin, alice, bob, john, network = ' $2
  admin=$(dfx --identity admin identity get-principal)
  ALICE=$(dfx --identity alice identity get-principal)
  BOB=$(dfx --identity bob identity get-principal)
  JOHN=$(dfx --identity john identity get-principal)

  echo "(*) Owner of NFT 0 (admin is $admin):"
  dfx canister call dip721_nft_container ownerOfDip721 '(0:nat64)'
  sleep 2s
  echo '(*) Number of NFTs admin owns:'
  dfx canister call dip721_nft_container balanceOfDip721 "(principal\"$admin\")"
  sleep 2s
  echo '(*) Number of NFTs Alice owns:'
  dfx canister call dip721_nft_container balanceOfDip721 "(principal\"$ALICE\")"
  sleep 2s
  echo '(*) Number of NFTs Bob owns:'
  dfx canister call dip721_nft_container balanceOfDip721 "(principal\"$BOB\")"
  sleep 2s
  echo "(*) Owner of NFT 1 (john is $john):"
  dfx canister call dip721_nft_container ownerOfDip721 '(1:nat64)'
  sleep 2s
  echo '(*) Number of NFTs John owns:'
  dfx canister call dip721_nft_container balanceOfDip721 "(principal\"$JOHN\")"
  echo '(*) Total NFTs in existence:'
  dfx canister call dip721_nft_container totalSupplyDip721

elif [[ $1 == "transfer" ]]; then
  echo $1 ': Transfer one NFT from admin to Alice, network = ' $2
  dfx identity use admin
  admin=$(dfx identity get-principal)
  ALICE=$(dfx --identity alice identity get-principal)
  BOB=$(dfx --identity bob identity get-principal)

  echo '(*) Transferring the NFT from admin to Alice:'
  dfx canister call dip721_nft_container transferFromDip721 "(principal\"$admin\",principal\"$ALICE\",0:nat64)"
  echo "(*) Owner of NFT 0 (Alice is $ALICE):"
  dfx canister call dip721_nft_container ownerOfDip721 '(0:nat64)'
  echo '(*) Number of NFTs admin owns:'
  dfx canister call dip721_nft_container balanceOfDip721 "(principal\"$admin\")"
  echo '(*) Number of NFTs Alice owns:'
  dfx canister call dip721_nft_container balanceOfDip721 "(principal\"$ALICE\")"

elif [[ $1 == "approve" ]]; then
  echo $1 'approveDip721, setApprovalForAllDip721, network = ' $2
  dfx identity use admin
  admin=$(dfx identity get-principal)
  ALICE=$(dfx --identity alice identity get-principal)
  BOB=$(dfx --identity bob identity get-principal)

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
  echo '(*) admin is a custodian, so admin can transfer the NFT back to itself without approval:'
  dfx canister call dip721_nft_container transferFromDip721 "(principal\"$ALICE\",principal\"$admin\",0:nat64)"


else 
  echo -e "not matched command"
fi
# /tmp/repoPath/alice/chains/local_testnet/db/full    
