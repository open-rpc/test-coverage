import fetch from 'isomorphic-fetch';
let id = 1;

export default (method: string, params: any[]) => {
  return fetch('http://localhost:8545', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: id++,
      method,
      params
    })
  }).then((r: any) => {
    return r.json();
  })
};