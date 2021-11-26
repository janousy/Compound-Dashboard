import { getWalletAddress, getWeb3Instance, logBalancesBorrow } from "./utils";
import { cErcAbi, cEthAbi, erc20Abi } from "./contracts/contracts.json";
import { ADDRESSES, ERC20 } from "../const/addresses";
import { abi as borrowContractAbi } from "./contracts/CompoundBorrow.json";

export async function repayErc20(underlyingToRepayBorrow) {
    console.log(`Calling repayErc20 with ${underlyingToRepayBorrow} Erc20..`);

    const assetName = ERC20.name;
    const underlyingDecimals = ERC20.decimals;

    if (!underlyingToRepayBorrow) {
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

    const myWalletAddress = await getWalletAddress();
    const fromMyWallet = {
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(4000000),
        gasPrice: web3.utils.toHex(25000000000) // use ethgasstation.info (mainnet only)
    };

    console.log(`Approving ${assetName} to be transferred from your wallet to the c${assetName} contract...`);
    const underlyingToRepay = (underlyingToRepayBorrow * Math.pow(10, underlyingDecimals)).toString();
    await underlying.methods.approve(ADDRESSES.cTokenAddress, underlyingToRepay).send(fromMyWallet);

    const repayBorrow = await cToken.methods.repayBorrow(underlyingToRepay).send(fromMyWallet);

    if (repayBorrow.events && repayBorrow.events.Failure) {
        const errorCode = repayBorrow.events.Failure.returnValues.error;
        console.error(`repayBorrow error, code ${errorCode}`);
        process.exit(1);
    }

    console.log(`\nBorrow repaid.\n`);

    return repayBorrow;
};

repayErc20().catch(async (err) => {
    console.error('ERROR:', err);
    // Create "events" and "emit" them in your Solidity code.
    // Current contract does not have any.
    const web3 = getWeb3Instance();
    const borrowContract = new web3.eth.Contract(borrowContractAbi, ADDRESSES.borrowContractAddress);
    let logs = await borrowContract.getPastEvents('allEvents');
    console.log('Logs: ', logs);
    return err;
});
