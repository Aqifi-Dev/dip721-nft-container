const { Principal } = require('@dfinity/principal');
const ic = require('ic0');
//import { HttpAgent } from '@dfinity/agent';
//const ic = replica(new HttpAgent({ ... })); // Use a custom agent from `@dfinity/agent`

const log1 = console.log;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

log1('checkpoint 1');

const canisterId = process.env.DIP721_NFT_CONTAINER_CANISTER_ID;

const localCanisterIds = require('../../.dfx/local/canister_ids.json');
// For TS: assert { type: 'json' };
const localDip721_Id = localCanisterIds.dip721_nft_container.local;

log1(
  'canisterId:',
  canisterId?.toString(),
  ', localDip721_Id:',
  localDip721_Id
);
const effectiveCanisterId = canisterId?.toString() ?? localDip721_Id;
log1('effectiveCanisterId:', effectiveCanisterId, typeof effectiveCanisterId);

const localDip721 = ic.local(effectiveCanisterId);
log1('canister instance established');

const main = async () => {
  await delay(3000);
  const nameDip721 = await localDip721.call('nameDip721');
  log1('nameDip721:', nameDip721);
  await delay(3000);
  let nft_metadata_out = await localDip721.call('get_metadata_v2', 0);
  log1('nft_metadata_out[0]:', nft_metadata_out);
  await delay(3000);

  const nft_to =
    'hvnpv-7tz4x-urwpp-mtaw3-75xzo-v5mwr-b43ba-qgrtn-pc4kv-zy2dg-tqe';
  log1('nft_to:', nft_to);
  const nft_to_principal = Principal.fromText(nft_to);

  let totalsuply = await localDip721.call('totalSupplyDip721');
  log1('totalsuply:', totalsuply);
  await delay(3000);

  let balance1 = await localDip721.call('balanceOfDip721', nft_to_principal);
  log1('balance1 B4:', balance1);
  await delay(3000);

  let nft_metadata = 'nft_name:Horse';
  await delay(3000);

  log1('to mint nft'); //http://127.0.0.1:4943/
  const out = await localDip721.call(
    'mintDip721forall',
    nft_to_principal,
    nft_metadata
  );
  await delay(3000);
  let outText =
    'Minting Success! New NFT id:' +
    out.Ok.id +
    ', token_id:' +
    out.Ok.token_id;
  log1('out:', out);

  balance1 = await localDip721.call('balanceOfDip721', nft_to_principal);
  log1('balance1 AF:', balance1);
  await delay(3000);

  nft_metadata_out = await localDip721.call('get_metadata_v2', 1);
  log1('nft_metadata_out:', nft_metadata_out);

  log1('end');
};
main();
