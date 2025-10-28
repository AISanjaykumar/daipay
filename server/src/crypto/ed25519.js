import nacl from "tweetnacl";
import bs58 from "bs58";

export function genKeypair() {
  const kp = nacl.sign.keyPair();
  return {
    pubkey: bs58.encode(kp.publicKey),
    secret: bs58.encode(kp.secretKey),
  };
}

export function sign(secretBase58, msgUint8) {
  const sk = bs58.decode(secretBase58);
  return bs58.encode(nacl.sign.detached(msgUint8, sk));
}

export function verify(pubBase58, msgUint8, sigBase58) {
  return nacl.sign.detached.verify(
    msgUint8,
    bs58.decode(sigBase58),
    bs58.decode(pubBase58)
  );
}
