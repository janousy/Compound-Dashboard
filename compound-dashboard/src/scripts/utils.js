import Web3 from "web3";

export function getWeb3Instance() {
    const Web3 = require('web3');
    const web3 = new Web3('http://localhost:8545');

    return web3;
}
