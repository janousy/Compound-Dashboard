// Example to borrow DAI (or any ERC20 token) using ETH as collateral
// from a Solidity smart contract

import { getWalletAddress, getWeb3Instance, logBalancesBorrow } from "./utils";
import { ADDRESSES, ERC20 } from "../const/addresses";
import { abi as borrowContractAbi } from "./contracts/CompoundBorrow.json";

export async function borrowErc20(numUnderlyingToBorrow, ethToSupplyAsCollateral) {
    if(!numUnderlyingToBorrow || ethToSupplyAsCollateral) {
        return;
    }
    console.log(`\nCalling borrowErc20 with ${ethToSupplyAsCollateral} ETH for collateral...\n`);

    const assetName = ERC20.name;
    const underlyingDecimals = ERC20.decimals;

    const {
        cEthAbi,
        cErcAbi,
        erc20Abi,
        comptrollerAbi,
        priceFeedAbi
    } = require('./contracts/contracts.json');

    const web3 = getWeb3Instance();
    const cEth = new web3.eth.Contract(cEthAbi, ADDRESSES.cEthAddress);
    const underlying = new web3.eth.Contract(erc20Abi, ADDRESSES.underlyingAddress);
    const cToken = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);
    const borrowContractAbi = require('./contracts/CompoundBorrow.json').abi;
    const borrowContract = new web3.eth.Contract(borrowContractAbi, ADDRESSES.borrowContractAddress);
    const comptroller = new web3.eth.Contract(comptrollerAbi, ADDRESSES.comptrollerAddress);
    const priceFeed = new web3.eth.Contract(priceFeedAbi, ADDRESSES.priceFeedAddress);

    const myWalletAddress = await getWalletAddress();
    const fromMyWallet = {
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(4000000),
        gasPrice: web3.utils.toHex(25000000000) // use ethgasstation.info (mainnet only)
    };

    console.log('\nSupplying ETH to the protocol as collateral (you will get cETH in return)...\n');
    let mint = await cEth.methods.mint().send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(175000),
        value: web3.utils.toHex(ethToSupplyAsCollateral * 1e18)
    });

    console.log('\nEntering market (via Comptroller contract) for ETH (as collateral)...');
    let markets = [ADDRESSES.cEthAddress]; // This is the cToken contract(s) for your collateral
    let enterMarkets = await comptroller.methods.enterMarkets(markets).send(fromMyWallet);

    console.log('Calculating your liquid assets in the protocol...');
    let { 1: liquidity } = await comptroller.methods.getAccountLiquidity(myWalletAddress).call();
    liquidity = liquidity / 1e18;

    console.log('Fetching cETH collateral factor...');
    let { 1: collateralFactor } = await comptroller.methods.markets(ADDRESSES.cEthAddress).call();
    collateralFactor = (collateralFactor / 1e18) * 100; // Convert to percent

    console.log(`Fetching ${assetName} price from the price feed...`);
    let underlyingPriceInUsd = await priceFeed.methods.price(assetName).call();
    underlyingPriceInUsd = underlyingPriceInUsd / 1e6; // Price feed provides price in USD with 6 decimal places

    console.log(`Fetching borrow rate per block for ${assetName} borrowing...`);
    let borrowRate = await cToken.methods.borrowRatePerBlock().call();
    borrowRate = borrowRate / Math.pow(10, underlyingDecimals);

    console.log(`\nYou have ${liquidity} of LIQUID assets (worth of USD) pooled in the protocol.`);
    console.log(`You can borrow up to ${collateralFactor}% of your TOTAL collateral supplied to the protocol as ${assetName}.`);
    console.log(`1 ${assetName} == ${underlyingPriceInUsd.toFixed(6)} USD`);
    console.log(`You can borrow up to ${liquidity / underlyingPriceInUsd} ${assetName} from the protocol.`);
    console.log(`NEVER borrow near the maximum amount because your account will be instantly liquidated.`);
    console.log(`\nYour borrowed amount INCREASES (${borrowRate} * borrowed amount) ${assetName} per block.\nThis is based on the current borrow rate.\n`);

    //const numUnderlyingToBorrow = 50;
    console.log(`Now attempting to borrow ${numUnderlyingToBorrow} ${assetName}...`);
    const scaledUpBorrowAmount = (numUnderlyingToBorrow * Math.pow(10, underlyingDecimals)).toString();
    const result = await cToken.methods.borrow(scaledUpBorrowAmount).send(fromMyWallet);

    console.log(`\nFetching ${assetName} borrow balance from c${assetName} contract...`);
    let balance = await cToken.methods.borrowBalanceCurrent(myWalletAddress).call();
    balance = balance / Math.pow(10, underlyingDecimals);
    console.log(`Borrow balance is ${balance} ${assetName}`);

    return result;
};

borrowErc20().catch(async (err) => {
    console.error('ERROR:', err);
    // Create "events" and "emit" them in your Solidity code.
    // Current contract does not have any.
    const web3 = getWeb3Instance();
    const borrowContract = new web3.eth.Contract(borrowContractAbi, ADDRESSES.borrowContractAddress);
    let logs = await borrowContract.getPastEvents('allEvents');
    console.log('Logs: ', logs);
    return err;
});