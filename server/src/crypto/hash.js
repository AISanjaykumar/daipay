import pkg from "js-sha3";
export function h512(input) {
  const { sha3_512 } = pkg;
  return sha3_512(input);
}
