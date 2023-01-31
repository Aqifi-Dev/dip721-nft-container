import { Blob } from 'buffer';
global.Blob = Blob;
import { AssetManager } from '@slide-computer/assets';
import { fileURLToPath } from 'url';
import { HttpAgent } from '@dfinity/agent';
import fetch from 'isomorphic-fetch';
import fs from 'fs';
import imageThumbnail from 'image-thumbnail';
import mmm from 'mmmagic';
import { createRequire } from 'node:module';
import path from 'path';
import prettier from 'prettier';
import sha256File from 'sha256-file';
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
const encoder = new TextEncoder();

log1('checkpoint 2'); //http://127.0.0.1:4943/
//log1(LOCAL_HOST + LOCAL_PORT)
//package.json:   "type": "module",
const localport = '4943';
const agent = new HttpAgent({
  identity: await identity,
  host: 'http://127.0.0.1:' + localport,
  fetch,
}); //If we want to talk to the IC mainnet, the host should point to https://ic0.app.

log1(
  'checkpoint 3',
  canisterId?.toString(),
  localCanisterIds.dip721_nft_container.local
);
const effectiveCanisterId =
  canisterId?.toString() ?? localCanisterIds.dip721_nft_container.local;

log1('checkpoint 4. effectiveCanisterId:', effectiveCanisterId);
const assetCanisterId = localCanisterIds.hello_frontend.local;
log1('checkpoint 5');
const admin_actor = createActor(effectiveCanisterId, {
  agent,
});
log1('checkpoint 6');

const assetManager = new AssetManager({
  canisterId: assetCanisterId,
  agent,
  concurrency: 32, // Optional (default: 32), max concurrent requests.
  maxSingleFileSize: 450000, // Optional bytes (default: 450000), larger files will be uploaded as chunks.
  maxChunkSize: 1900000, // Optional bytes (default: 1900000), size of chunks when file is uploaded as chunks.
});

log1('checkpoint 7', nftConfig);
// Prepare assets and metadata
nftConfig.reduce(async (prev, nft, idx) => {
  await prev;
  log1('starting upload for ' + nft.asset);

  log1('nftConfig 1');
  // Parse metadata, if present
  const metadata = Object.entries(nft.metadata ?? []).map(([key, value]) => {
    return [key, { TextContent: value }];
  });

  log1('nftConfig 2');
  const filePath = path.join(
    fileURLToPath(import.meta.url),
    '..',
    'assets',
    nft.asset
  );

  log1('nftConfig 3');
  const file = fs.readFileSync(filePath); // Blob of file
  const sha = sha256File(filePath); // SHA of file

  log1('nftConfig 4');
  // Prepare thumbnail
  const options = {
    width: 256,
    height: 256,
    jpegOptions: { force: true, quality: 90 },
  };
  log1('nftConfig 5 generating thumbnail');
  const thumbnail = await imageThumbnail(filePath, options);

  log1('nftConfig 6');
  // Detect filetype
  const magic = await new mmm.Magic(mmm.MAGIC_MIME_TYPE);
  const contentType = await new Promise((resolve, reject) => {
    magic.detectFile(filePath, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
  log1('nftConfig 7 detected contenttype of ', contentType);

  /**
   * For asset in nfts.json
   *
   * Take asset
   * Check extenstion / mimetype
   * Sha content
   * Generate thumbnail
   * Upload both to asset canister -> file paths
   * Generate metadata from key / value
   * Mint ^
   */
  log1('nftConfig 8');
  // Upload Assets
  const uploadedFilePath = `token/${idx}${path.extname(nft.asset)}`;
  const uploadedThumbnailPath = `thumbnail/${idx}.jpeg`;

  log1('nftConfig 9 uploading asset to ', uploadedFilePath);

  log1('nftConfig 10');
  //await assetManager.insert(file, { fileName: uploadedFilePath });
  log1('nftConfig 11 uploading thumbnail to ', uploadedThumbnailPath);

  log1('nftConfig 12');
  //await assetManager.insert(thumbnail, { fileName: uploadedThumbnailPath });

  log1('nftConfig 13');
  // Assemble the data and mint
  const data = [
    [
      'location',
      {
        TextContent: `http://${assetCanisterId}.localhost:${localport}/${uploadedFilePath}`,
      },
    ],
    [
      'thumbnail',
      {
        TextContent: `http://${assetCanisterId}.localhost:${localport}/${uploadedThumbnailPath}`,
      },
    ],
    ['contentType', { TextContent: contentType }],
    ['contentHash', { BlobContent: [...encoder.encode(sha)] }],
    ...metadata,
  ];

  log1('nftConfig 14');
  const principal = await (await identity).getPrincipal();
  log1('principal:', principal);

  /*
  let totalsuply = await dip721_nft_container.totalSupplyDip721();
  log1('totalsuply:', totalsuply);
  let balance1 = await dip721_nft_container.balanceOfDip721(principal);
  log1('balance1:', balance1);
  const image = thumbnail;
  const imageArray = await image.arrayBuffer();
  const imageByteData = [...new Uint8Array(imageArray)];
  await dip721_nft_container.mintDip721(principal, 'nft_name:monkey');
  //args_0: Principal, args_1: MetadataDesc, args_2: Uint8Array)
*/
  //return;
  let nameDip721 = await admin_actor.nameDip721();
  log1('nameDip721:', nameDip721);
  await delay(3000);

  let totalsuply = await admin_actor.totalSupplyDip721();
  log1('totalsuply:', totalsuply);
  await delay(3000);

  let balance1 = await admin_actor.balanceOfDip721(principal);
  log1('balance1:', balance1);
  await delay(3000);

  // let metaResult = await admin_actor.getMetadataDip721(0n);
  // log1('token 0n info: ', metaResult);
  // await delay(3000);
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
  /*const mintResult = await admin_actor.mintDip721(
    principal,
    'nft_name:King-Kong'
  );*/
  //const mintResult = await admin_actor.mintDip721(principal, BigInt(idx), data);
  log1('mint result: ', mintResult);
  await delay(3000);

  log1('nftConfig 17');
  balance1 = await admin_actor.balanceOfDip721(principal);
  log1('nftConfig 18. balance1:', balance1);
  await delay(3000);

  metaResult = await admin_actor.getMetadataDip721(0n);
  log1('new token info: ', metaResult);

  log1(
    'token metadata: ',
    prettier.format(
      JSON.stringify(metaResult, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ),
      { parser: 'json' }
    )
  );
  log1('end');
}, Promise.resolve(0));
log1('end');
