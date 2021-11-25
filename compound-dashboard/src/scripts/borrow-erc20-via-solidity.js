// Example to borrow DAI (or any ERC20 token) using ETH as collateral
// from a Solidity smart contract

import {getWalletAddress, getWeb3Instance, logBalancesBorrow} from "./utils";
import {ADDRESSES, ERC20} from "../const/addresses";
import {abi as borrowContractAbi} from "./contracts/CompoundBorrow.json";

export async function borrowErc20(numUnderlyingToBorrow, ethToSupplyAsCollateral) {
    console.log(`\nCalling CompoundBorrow with ${ethToSupplyAsCollateral} ETH for collateral...\n`);

    if (!numUnderlyingToBorrow || !ethToSupplyAsCollateral) {
        console.log("Invalid parameter(s)");
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
        throw Error('Compound BorrowContract is not deployed! Deploy it by running the deploy script.');
    }

    const myWalletAddress = await getWalletAddress();

    await logBalancesBorrow(web3, myWalletAddress, cEth, cToken, underlying, ERC20.name, ERC20.decimals);
    console.log(`\nSending ${ethToSupplyAsCollateral} ETH or ${ethToSupplyAsCollateral * 1e18} WEI to BorrowContract so it can provide collateral...\n`);
    console.log(`\nBorrowing ${numUnderlyingToBorrow} ${ERC20.name}...\n`);

    let result = await borrowContract.methods.borrowErc20Example(
        ADDRESSES.cEthAddress,
        ADDRESSES.comptrollerAddress,
        ADDRESSES.priceFeedAddress,
        ADDRESSES.cTokenAddress,
        ERC20.decimals,
        numUnderlyingToBorrow
    ).send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(5000000),
        gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
        value: (ethToSupplyAsCollateral * 1e18).toString()
    });

    // See the solidity functions logs from "MyLog" event
    // console.log(result.events.MyLog);
    await logBalancesBorrow(web3, myWalletAddress, cEth, cToken, underlying, ERC20.name, ERC20.decimals);

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