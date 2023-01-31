import { Blob } from 'buffer';
global.Blob = Blob;
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import fetch from 'isomorphic-fetch';
import { createRequire } from 'node:module';
import {
  canisterId,
  createActor,
} from '../declarations/dip721_nft_container/index.js';
import { identity } from './identity.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const log1 = console.log;
log1('checkpoint 1');

const require = createRequire(import.meta.url);
const localCanisterIds = require('../../.dfx/local/canister_ids.json');
const nftConfig = require('./nfts.json');

log1('checkpoint 2'); //http://127.0.0.1:4943/
const LOCAL_HOST = 'http://127.0.0.1:';
const IC_HOST = 'https://ic0.app';
const LOCAL_PORT = '4943';
log1(LOCAL_HOST + LOCAL_PORT);
const agent = new HttpAgent({
  identity: await identity,
  host: LOCAL_HOST + LOCAL_PORT,
  fetch,
});

log1(
  'checkpoint 3',
  canisterId?.toString(),
  localCanisterIds.dip721_nft_container.local
);
const effectiveCanisterId =
  canisterId?.toString() ?? localCanisterIds.dip721_nft_container.local;

log1('checkpoint 4. effectiveCanisterId:', effectiveCanisterId);
log1('checkpoint 5');
const admin_actor = createActor(effectiveCanisterId, {
  agent,
});
log1('checkpoint 6');

log1('checkpoint 7', nftConfig);

//const nft_to ='hvnpv-7tz4x-urwpp-mtaw3-75xzo-v5mwr-b43ba-qgrtn-pc4kv-zy2dg-tqe';
//const principal = Principal.fromText(nft_to);
const principal = await (await identity).getPrincipal();
//log1('principal:', principal);

/*
const image = thumbnail;
const imageArray = await image.arrayBuffer();
const imageByteData = [...new Uint8Array(imageArray)];
*/
let nameDip721 = await admin_actor.nameDip721();
log1('nameDip721:', nameDip721);
await delay(3000);

let totalsuply = await admin_actor.totalSupplyDip721();
log1('totalsuply:', totalsuply);
await delay(3000);

let balance1 = await admin_actor.balanceOfDip721(principal);
log1('balance1:', balance1);
await delay(3000);

let metadata = await admin_actor.get_metadata_v2(0n);
log1('metadata 0n: ', metadata);
await delay(3000);
/* 
  package.json: "type": "module",

  dfx.json:
    "declarations": {
      "node_compatibility": true
    }
*/
log1('nftConfig 15: to mint');
const mintResult = await admin_actor.mintDip721forall(
  principal,
  'nft_name:Donkey'
);
log1('mint result: ', mintResult);
await delay(3000);

log1('nftConfig 17');
balance1 = await admin_actor.balanceOfDip721(principal);
log1('balance1:', balance1);
await delay(3000);

metadata = await admin_actor.get_metadata_v2(0n);
log1('nftConfig 18. metadata: ', metadata);

log1('end');
