import stringify from 'json-stable-stringify';
export function canonical(obj){
  return stringify(obj, { space: 0 });
}
