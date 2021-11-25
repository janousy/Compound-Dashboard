import Web3 from "web3";
import {ADDRESSES} from "../const/addresses";

export function getWeb3Instance() {
    const Web3 = require('web3');
    const web3 = new Web3('http://localhost:8545');

    return web3;
}

export async function logBalancesBorrow(web3, myWalletAddress, cEth, cToken, underlying, underlyingAssetName, underlyingDecimals) {
    return new Promise(async (resolve, reject) => {
        const myWalletUnderlyingBalance = +await underlying.methods.balanceOf(myWalletAddress).call() / 1e18;
        const myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(ADDRESSES.borrowContractAddress));
        const myContractCEthBalance = await cEth.methods.balanceOf(ADDRESSES.borrowContractAddress).call() / 1e8;
        const myContractUnderlyingBalance = +await underlying.methods.balanceOf(ADDRESSES.borrowContractAddress).call() / Math.pow(10, underlyingDecimals);
        const myContractCTokenBalance = +await cToken.methods.balanceOf(ADDRESSES.borrowContractAddress).call() / 1e8;

        console.log(`My Wallet's   ${underlyingAssetName} Balance:`, myWalletUnderlyingBalance);
        console.log(`RepayContract's  ETH Balance:`, myContractEthBalance);
        console.log(`RepayContract's cETH Balance:`, myContractCEthBalance);
        console.log(`RepayContract's  ${underlyingAssetName} Balance:`, myContractUnderlyingBalance);
        console.log(`RepayContract's c${underlyingAssetName} Balance:`, myContractCTokenBalance);

        resolve();
    });
};

export async function getWalletAddress() {
    const { ethereum } = window;
    await ethereum.request({ method: 'eth_requestAccounts' });
    let myWalletAddress = await ethereum.request({method: 'eth_accounts'});
    myWalletAddress = myWalletAddress[0];
    return myWalletAddress;
}