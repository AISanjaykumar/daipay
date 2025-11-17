import nacl from "tweetnacl";
import bs58 from "bs58";

export function genKeypair() {
  const kp = nacl.sign.keyPair();
  return {
    pubkey: bs58.encode(kp.publicKey),
    secret: bs58.encode(kp.secretKey),
  };
}
