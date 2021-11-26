// Example to supply DAI as collateral and borrow ETH
// YOU MUST HAVE DAI IN YOUR WALLET before you run this script
import { getWalletAddress, getWeb3Instance, logBalancesBorrow } from "./utils";
import { ADDRESSES, ERC20 } from "../const/addresses";
import { cErcAbi, cEthAbi, erc20Abi } from "./contracts/contracts.json";
import { abi as borrowContractAbi } from "./contracts/CompoundBorrow.json";

export async function borrowETH(numETHToBorrow, underlyingAsCollateral) {
    const assetName = ERC20.name;
    const underlyingDecimals = ERC20.decimals;

    if (!numETHToBorrow || !underlyingAsCollateral) {
        console.log("Invalid parameter(s)")
        return;
    }

    console.log(`\nCalling borrowETH with ${underlyingAsCollateral} ${assetName} as collateral...\n`);

    const {
        cEthAbi,
        cErcAbi,
        erc20Abi,
        comptrollerAbi,
        priceFeedAbi,
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

    // Convert the token amount to a scaled up number, then a string.
    underlyingAsCollateral = underlyingAsCollateral * Math.pow(10, underlyingDecimals);
    underlyingAsCollateral = underlyingAsCollateral.toString();

    console.log(`\nApproving ${assetName} to be transferred from your wallet to the c${assetName} contract...\n`);
    await underlying.methods.approve(ADDRESSES.cTokenAddress, underlyingAsCollateral).send(fromMyWallet);

    console.log(`Supplying ${assetName} to the protocol as collateral (you will get c${assetName} in return)...\n`);
    let mint = await cToken.methods.mint(underlyingAsCollateral).send(fromMyWallet);

    if (mint.events && mint.events.Failure) {
        throw new Error(
            `See https://compound.finance/docs/ctokens#ctoken-error-codes\n` +
            `Code: ${mint.events.Failure.returnValues[0]}\n`
        );
    }

    console.log('\nEntering market (via Comptroller contract) for ETH (as collateral)...');
    let markets = [ADDRESSES.cTokenAddress]; // This is the cToken contract(s) for your collateral
    let enterMarkets = await comptroller.methods.enterMarkets(markets).send(fromMyWallet);

    console.log('Calculating your liquid assets in the protocol...');
    let { 1: liquidity } = await comptroller.methods.getAccountLiquidity(myWalletAddress).call();
    liquidity = web3.utils.fromWei(liquidity).toString();

    console.log(`Fetching the protocol's ${assetName} collateral factor...`);
    let { 1: collateralFactor } = await comptroller.methods.markets(ADDRESSES.cTokenAddress).call();
    collateralFactor = (collateralFactor / Math.pow(10, underlyingDecimals)) * 100; // Convert to percent

    console.log(`Fetching ${assetName} price from the price feed...`);
    let underlyingPriceInUsd = await priceFeed.methods.price(assetName).call();
    underlyingPriceInUsd = underlyingPriceInUsd / 1e6; // Price feed provides price in USD with 6 decimal places

    console.log('Fetching borrow rate per block for ETH borrowing...');
    let borrowRate = await cEth.methods.borrowRatePerBlock().call();
    borrowRate = borrowRate / 1e18;

    console.log(`\nYou have ${liquidity} of LIQUID assets (worth of USD) pooled in the protocol.`);
    console.log(`You can borrow up to ${collateralFactor}% of your TOTAL assets supplied to the protocol as ETH.`);
    console.log(`1 ${assetName} == ${underlyingPriceInUsd.toFixed(6)} USD`);
    console.log(`You can borrow up to ${liquidity} USD worth of assets from the protocol.`);
    console.log(`NEVER borrow near the maximum amount because your account will be instantly liquidated.`);
    console.log(`\nYour borrowed amount INCREASES (${borrowRate} * borrowed amount) ETH per block.\nThis is based on the current borrow rate.`);

    // Let's try to borrow (or another amount far below the borrow limit)
    console.log(`\nNow attempting to borrow ${numETHToBorrow} ETH...`);
    const borrowResult = await cEth.methods.borrow(web3.utils.toWei(numETHToBorrow.toString(), 'ether')).send(fromMyWallet);

    if (isNaN(borrowResult)) {
        console.log(`\nETH borrow successful.\n`);
    } else {
        throw new Error(
            `See https://compound.finance/docs/ctokens#ctoken-error-codes\n` +
            `Code: ${borrowResult}\n`
        );
    }

    console.log('\nFetching your ETH borrow balance from cETH contract...');
    let balance = await cEth.methods.borrowBalanceCurrent(myWalletAddress).call();
    balance = balance / 1e18; // because DAI is a 1e18 scaled token.
    console.log(`Borrow balance is ${balance} ETH`);

    return borrowResult;
};

borrowETH().catch(async (err) => {
    console.error('ERROR:', err);
    // Create "events" and "emit" them in your Solidity code.
    // Current contract does not have any.
    const web3 = getWeb3Instance();
    const borrowContract = new web3.eth.Contract(borrowContractAbi, ADDRESSES.borrowContractAddress);
    let logs = await borrowContract.getPastEvents('allEvents');
    console.log('Logs: ', logs);
    return err;
});