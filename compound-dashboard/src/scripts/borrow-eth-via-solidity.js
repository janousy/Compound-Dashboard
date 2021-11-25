// Example to supply DAI as collateral and borrow ETH
// YOU MUST HAVE DAI IN YOUR WALLET before you run this script
import {getWalletAddress, getWeb3Instance, logBalancesBorrow} from "./utils";
import {ADDRESSES, ERC20} from "../const/addresses";
import {cErcAbi, cEthAbi, erc20Abi} from "./contracts/contracts.json";
import {abi as borrowContractAbi} from "./contracts/CompoundBorrow.json";

export async function borrowETH(numETHToBorrow, underlyingAsCollateral) {
    const underlyingAssetName = 'DAI';
    console.log(`\nCalling BorrowContract.borrowEthExample with ${underlyingAsCollateral} ${underlyingAssetName} as collateral...\n`);
    if (!numETHToBorrow || !underlyingAsCollateral) {
        console.log("Invalid parameter(s)")
        return;
    }

    const {
        cEthAbi,
        cErcAbi,
        erc20Abi,
    } = require('./contracts/contracts.json');

    const web3 = getWeb3Instance();
    const cEth = new web3.eth.Contract(cEthAbi, ADDRESSES.cEthAddress);
    const underlying = new web3.eth.Contract(erc20Abi, ADDRESSES.underlyingAddress);
    const cToken = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);
    const borrowContractAbi = require('./contracts/CompoundBorrow.json').abi;
    const borrowContract = new web3.eth.Contract(borrowContractAbi, ADDRESSES.borrowContractAddress);


    const contractIsDeployed = (await web3.eth.getCode(ADDRESSES.borrowContractAddress)) !== '0x';
    if (!contractIsDeployed) {
        throw Error('BorrowContract is not deployed! Deploy it by running the deploy script.');
    }

    const myWalletAddress = await getWalletAddress();

    const fromMyWallet = {
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(4000000),
        gasPrice: web3.utils.toHex(25000000000) // use ethgasstation.info (mainnet only)
    };

    await logBalancesBorrow(web3, myWalletAddress, cEth, cToken, underlying, ERC20.name, ERC20.decimals);

    const mantissa = (underlyingAsCollateral * Math.pow(10, ERC20.decimals)).toString();
    console.log(`\nSending ${underlyingAsCollateral} ${underlyingAssetName} to BorrowContract so it can provide collateral...\n`);
    console.log('ExchangeRateMantissa:' + mantissa)
    // Send underlying to MyContract before attempting the supply
    await underlying.methods.transfer(ADDRESSES.borrowContractAddress, mantissa).send(fromMyWallet);
    await logBalancesBorrow(web3, myWalletAddress, cEth, cToken, underlying, ERC20.name, ERC20.decimals);

    //const numWeiToBorrow = 2000000000000000;
    const numWeiToBorrow = Math.pow(numETHToBorrow, 18)
    let result = await borrowContract.methods.borrowEthExample(
        ADDRESSES.cEthAddress,
        ADDRESSES.comptrollerAddress,
        ADDRESSES.cTokenAddress,
        ADDRESSES.underlyingAddress,
        mantissa,
        numWeiToBorrow
    ).send(fromMyWallet);

    console.log(result)
    //See the solidity functions logs from "MyLog" event
    //console.log(JSON.stringify(result), '\n');
    await logBalancesBorrow(web3, myWalletAddress, cEth, cToken, underlying, ERC20.name, ERC20.decimals);
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