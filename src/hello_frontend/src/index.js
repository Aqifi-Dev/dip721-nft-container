import { dip721_nft_container } from '../../declarations/dip721_nft_container';
import { Principal } from '@dfinity/principal';

export const lg = console.log;
export const isEmpty = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === 'object' && Object.keys(value).length === 0) ||
  (typeof value === 'string' && value.trim().length === 0) ||
  (typeof value === 'string' && value === 'undefined');

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  lg('----------== submit button clicked');
  const buttonId = document.activeElement.id;
  lg('buttonId:', buttonId, typeof buttonId);
  let outText = '';
  let outText2 = '';

  if (buttonId === 'get-metadata') {
    lg('--== get-metadata detected');
    const button = e.target.querySelector('#get-metadata');
    const nft_id = document.getElementById('nft_id').value.toString();
    lg('nft_id:', nft_id);
    if (isEmpty(nft_id)) {
      outText = 'nft_id is empty';
    } else if (isNaN(nft_id)) {
      outText = 'input is not a number';
    } else {
      lg('input is valid');
      button.setAttribute('disabled', true);
      const input = Number(nft_id);
      lg('input:', input, typeof input);
      const metadata_out = await dip721_nft_container.get_metadata_v2(input);
      outText = metadata_out.Ok;
      lg('metadata_out:', metadata_out, ', outText:', outText);
      button.removeAttribute('disabled');
    }
  } else if (buttonId === 'mint-nft') {
    lg('--== mint-nft detected');
    const button = e.target.querySelector('#mint-nft');
    button.setAttribute('disabled', true);
    const nft_metadata = document
      .getElementById('nft_metadata')
      .value.toString();
    lg('nft_metadata:', nft_metadata);

    const nft_to = document.getElementById('nft_to').value.toString();
    lg('nft_to:', nft_to);
    const nft_to_principal = Principal.fromText(nft_to);
    //const john = 'hvnpv-7tz4x-urwpp-mtaw3-75xzo-v5mwr-b43ba-qgrtn-pc4kv-zy2dg-tqe';
    const out = await dip721_nft_container.mintDip721forall(
      nft_to_principal,
      nft_metadata
    );
    button.removeAttribute('disabled');
    outText =
      'Minting Success! New NFT id:' +
      out.Ok.id +
      ', token_id:' +
      out.Ok.token_id;
    lg('out:', out);
  } else if (buttonId === 'show-nft-balance') {
    lg('--== show-nft-balance detected');
    const button = e.target.querySelector('#show-nft-balance');
    const nft_to = document.getElementById('nft_to').value.toString();
    lg('nft_to:', nft_to);
    //const john = 'hvnpv-7tz4x-urwpp-mtaw3-75xzo-v5mwr-b43ba-qgrtn-pc4kv-zy2dg-tqe';
    const nft_id = document.getElementById('nft_id').value.toString();
    lg('nft_id:', nft_id);
    const input = Number(nft_id);
    lg('input:', input, typeof input);

    if (isEmpty(nft_to)) {
      outText = 'nft_to is empty';
    } else if (isEmpty(nft_id)) {
      outText = 'nft_id is empty';
    } else if (isNaN(nft_id)) {
      outText = 'input is not a number';
    } else {
      lg('input is valid');
      let nft_owner = await dip721_nft_container.ownerOfDip721(input);
      lg('nft_owner:', nft_owner);
      if (
        typeof nft_owner === 'object' &&
        nft_owner.hasOwnProperty('Ok') &&
        nft_owner.Ok.hasOwnProperty('_arr')
      ) {
        lg('nft_owner.Ok._arr:', nft_owner.Ok._arr);
        nft_owner = Principal.fromUint8Array(nft_owner.Ok._arr);
      } else {
        nft_owner = 'error: nft_id does not exist or other error';
      }

      button.setAttribute('disabled', true);
      const nft_to_principal = Principal.fromText(nft_to);
      const balance = await dip721_nft_container.balanceOfDip721(
        nft_to_principal
      );
      lg('balance:', balance);
      button.removeAttribute('disabled');
      outText = 'balance of ' + nft_to + ':' + balance;
      outText2 = 'owner of NFT ' + nft_id + ':' + nft_owner;
    }
  } else {
    lg('invalid buttonId');
  }
  lg('outText:', outText);
  document.getElementById('metadata').innerText = outText;
  document.getElementById('metadata-two').innerText = outText2;

  return false;
});
