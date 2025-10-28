// Seed: creates 2 wallets and a sample payment between them.
import mongoose from 'mongoose';
import { genKeypair } from '../src/crypto/ed25519.js';
import { createWallet, credit, getBalance } from '../src/services/wallet.service.js';
import { submitPayment } from '../src/services/payment.service.js';
import { canonical } from '../src/crypto/canonical.js';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/daipay';

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function main(){
  await mongoose.connect(MONGO_URL);

  // create wallets
  const A = genKeypair();
  const B = genKeypair();
  const wA = await createWallet(A.pubkey, 'seed-A');
  const wB = await createWallet(B.pubkey, 'seed-B');

  // fund A
  await credit(wA.wallet_id, 2_000_000); // 2 DAI

  // build canonical body
  const body = {
    from: wA.wallet_id,
    to: wB.wallet_id,
    amount_micros: 250000, // 0.25
    nonce: 'seed-nonce-1',
    timestamp: new Date().toISOString(),
    ref: 'por:seed-demo'
  };
  const c = canonical(body);

  // sign
  const { sign } = await import('../src/crypto/ed25519.js');
  const bs58 = (await import('bs58')).default;
  const sig = bs58.encode((await import('tweetnacl')).default.sign.detached(new TextEncoder().encode(c), bs58.decode(A.secret)));

  // submit
  const out = await submitPayment(body, sig, A.pubkey);
  console.log('Seed complete:', {
    walletA: { wallet_id: wA.wallet_id, pubkey: A.pubkey, secret: A.secret },
    walletB: { wallet_id: wB.wallet_id, pubkey: B.pubkey, secret: B.secret },
    payment: out
  });

  await mongoose.disconnect();
}

main().catch(e=>{ console.error(e); process.exit(1); });
