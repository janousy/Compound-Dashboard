import {ADDRESSES} from "../const/addresses";

export function getWeb3Instance() {
    const Web3 = require('web3');
    const web3 = new Web3('http://localhost:8545');

    return web3;
}

export async function logBalancesBorrow(web3, myWalletAddress, cEth, cToken, underlying, underlyingAssetName, underlyingDecimals) {
    return new Promise(async (resolve, reject) => {
        const myWalletUnderlyingBalance = +await underlying.methods.balanceOf(myWalletAddress).call() / 1e18;
        const myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(ADDRESSES.borrowContractAddress)) * 1e18;
        const myContractCEthBalance = await cEth.methods.balanceOf(ADDRESSES.borrowContractAddress).call() / 1e8;
        const myContractUnderlyingBalance = +await underlying.methods.balanceOf(ADDRESSES.borrowContractAddress).call() / Math.pow(10, underlyingDecimals);
        const myContractCTokenBalance = +await cToken.methods.balanceOf(ADDRESSES.borrowContractAddress).call() / 1e8;

        console.log(`My Wallet's   ${underlyingAssetName} Balance:`, myWalletUnderlyingBalance);
        console.log(`BorrowContract's  ETH Balance:`, myContractEthBalance);
        console.log(`BorrowContract's cETH Balance:`, myContractCEthBalance);
        console.log(`BorrowContract's  ${underlyingAssetName} Balance:`, myContractUnderlyingBalance);
        console.log(`BorrowContract's c${underlyingAssetName} Balance:`, myContractCTokenBalance);

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

export async function getBorrowMarketStats(cEthAbi, cErcAbi, erc20Abi) {
    console.log('retrieving borrow market data')

    const web3 = getWeb3Instance();
    const cEth = new web3.eth.Contract(cEthAbi, ADDRESSES.cEthAddress);
    const underlying = new web3.eth.Contract(erc20Abi, ADDRESSES.underlyingAddress);
    const cToken = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);

    const borrowContractAbi = require('./contracts/CompoundBorrow.json').abi;
    const borrowContract = new web3.eth.Contract(borrowContractAbi, ADDRESSES.borrowContractAddress);

    const myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(ADDRESSES.borrowContractAddress)) * 1e18;
    const myContractCEthBalance = await cEth.methods.balanceOf(ADDRESSES.borrowContractAddress).call() / 1e8;
    const myContractUnderlyingBalance = +await underlying.methods.balanceOf(ADDRESSES.borrowContractAddress).call() / 1e18;
    const myContractCTokenBalance = +await cToken.methods.balanceOf(ADDRESSES.borrowContractAddress).call() / 1e8;

    return {myContractEthBalance, myContractCEthBalance, myContractUnderlyingBalance, myContractCTokenBalance};
}

export async function getSupplyMarketStats(cEthAbi, cErcAbi, erc20Abi) {
    console.log('retrieving supply market data')

    const web3 = getWeb3Instance();
    const cEth = new web3.eth.Contract(cEthAbi, ADDRESSES.cEthAddress);
    const underlying = new web3.eth.Contract(erc20Abi, ADDRESSES.underlyingAddress);
    const cToken = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);

    const supplyContractAbi = require('./contracts/CompoundSupply.json').abi;
    const supplyContract = new web3.eth.Contract(supplyContractAbi, ADDRESSES.supplyContractAddress);

    const myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(ADDRESSES.supplyContractAddress)) * 1e18;
    const myContractCEthBalance = await cEth.methods.balanceOf(ADDRESSES.supplyContractAddress).call() / 1e8;
    const myContractUnderlyingBalance = +await underlying.methods.balanceOf(ADDRESSES.supplyContractAddress).call() / 1e18;
    const myContractCTokenBalance = +await cToken.methods.balanceOf(ADDRESSES.supplyContractAddress).call() / 1e8;

    return {myContractEthBalance, myContractCEthBalance, myContractUnderlyingBalance, myContractCTokenBalance};
}

export async function getUserStats(cEthAbi, cErcAbi, erc20Abi) {

    const web3 = getWeb3Instance();
    const myWalletAddress = await getWalletAddress();

    const cEth = new web3.eth.Contract(cEthAbi, ADDRESSES.cEthAddress);
    const underlying = new web3.eth.Contract(erc20Abi, ADDRESSES.underlyingAddress);
    const cToken = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);

    let ethBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
    let cEthBalance = await cEth.methods.balanceOf(myWalletAddress).call() / 1e8;
    let erc20Balance = +await underlying.methods.balanceOf(myWalletAddress).call() / 1e18;
    let cErc20Balance = +await cToken.methods.balanceOf(myWalletAddress).call() / 1e18;

    return {ethBalance, cEthBalance, erc20Balance, cErc20Balance};
}

export async function getExchangeRates(cEthAbi, cErcAbi, erc20Abi) {
    const ethDecimals = 2;

    const web3 = getWeb3Instance();

    const cEthContract = new web3.eth.Contract(cEthAbi, ADDRESSES.cEthAddress);
    const cToken = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);

    //urrent exchange rate from cETH to ETH
    let cEthExchangeRate = await cEthContract.methods.exchangeRateCurrent().call();
    cEthExchangeRate = cEthExchangeRate / Math.pow(10, 18 + ethDecimals - 8);

    // Erc20 ExchangeRateMantissa
    let erc20ExchangeRate = await cToken.methods.exchangeRateCurrent().call();

    return {cEthExchangeRate, erc20ExchangeRate};
}