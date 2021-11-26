import { ADDRESSES } from "../const/addresses";

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
    let myWalletAddress = await ethereum.request({ method: 'eth_accounts' });
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

    const cEthBorrows = (await cEth.methods.totalBorrowsCurrent().call());
    const cTokenBorrows = (await cToken.methods.totalBorrowsCurrent().call());

    return { cEthBorrows, cTokenBorrows };
    //return {myContractEthBalance, myContractCEthBalance, myContractUnderlyingBalance, myContractCTokenBalance};
}

export async function getSupplyMarketStats(cEthAbi, cErcAbi, erc20Abi) {
    console.log('retrieving supply market data')

    const web3 = getWeb3Instance();
    const cEth = new web3.eth.Contract(cEthAbi, ADDRESSES.cEthAddress);
    const underlying = new web3.eth.Contract(erc20Abi, ADDRESSES.underlyingAddress);
    const cToken = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);

    const cEthSupply = (await cEth.methods.totalSupply().call());
    const cTokenSupply = (await cToken.methods.totalSupply().call());

    return { cEthSupply, cTokenSupply }
}

export async function getUserAssets(cEthAbi, cErcAbi, erc20Abi) {

    const web3 = getWeb3Instance();
    const myWalletAddress = await getWalletAddress();

    const cEth = new web3.eth.Contract(cEthAbi, ADDRESSES.cEthAddress);
    const underlying = new web3.eth.Contract(erc20Abi, ADDRESSES.underlyingAddress);
    const cToken = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);

    let ethBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
    let cEthBalance = +await cEth.methods.balanceOf(myWalletAddress).call() / 1e8;
    let erc20Balance = +await underlying.methods.balanceOf(myWalletAddress).call() / 1e18;
    let cErc20Balance = +await cToken.methods.balanceOf(myWalletAddress).call() / 1e8;

    return { ethBalance, cEthBalance, erc20Balance, cErc20Balance };
}

export async function getUserBorrows(cEthAbi, cErcAbi, erc20Abi) {

    const web3 = getWeb3Instance();
    const myWalletAddress = await getWalletAddress();

    const cEth = new web3.eth.Contract(cEthAbi, ADDRESSES.cEthAddress);
    const cToken = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);

    let cEthBorrowBalance = +await cEth.methods.borrowBalanceCurrent(myWalletAddress).call() / 1e8;
    let cErc20BorrowBalance = +await cToken.methods.borrowBalanceCurrent(myWalletAddress).call() / 1e8;

    console.log(cEthBorrowBalance);

    return {cEthBorrowBalance, cErc20BorrowBalance}
}

export async function getExchangeRates(cEthAbi, cErcAbi, erc20Abi) {
    const web3 = getWeb3Instance();

    const cEthContract = new web3.eth.Contract(cEthAbi, ADDRESSES.cEthAddress);
    const cToken = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);

    //urrent exchange rate from cETH to ETH
    let cEthExchangeRate = await cEthContract.methods.exchangeRateCurrent().call();
    cEthExchangeRate = cEthExchangeRate / 1e28;

    // Erc20 ExchangeRateMantissa
    let cErc20ExchangeRate = await cToken.methods.exchangeRateCurrent().call() / 1e28;

    return { cEthExchangeRate, cErc20ExchangeRate };
}

export async function getCollateralFactors(comptrollerAbi, market, decimals) {

    const web3 = getWeb3Instance();

    const comptroller = new web3.eth.Contract(comptrollerAbi, ADDRESSES.comptrollerAddress);
    const result = await comptroller.methods.markets(market).call();
    const { 0: isListed, 1: collateralFactorMantissa, 2: isComped } = result;
    return collateralFactorMantissa / Math.pow(10, decimals);
}