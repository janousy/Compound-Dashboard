// Example to supply DAI as collateral and borrow ETH
// YOU MUST HAVE DAI IN YOUR WALLET before you run this script

import { ADDRESSES, ERC20 } from "../const/addresses";
import { getWalletAddress, getWeb3Instance, logBalancesBorrow } from "./utils";
import { cErcAbi, cEthAbi, erc20Abi } from "./contracts/contracts.json";
import { abi as borrowContractAbi } from "./contracts/CompoundBorrow.json";

export async function repayETH(ethToRepayBorrow) {
    console.log(`\nCalling ethToRepayBorrow with ${ethToRepayBorrow} ETH for repay...\n`);
    if (!ethToRepayBorrow) {
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

    console.log(`Now repaying the borrow...`);

    const result = await cEth.methods.repayBorrow().send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(600000),
        gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
        value: web3.utils.toWei(ethToRepayBorrow.toString(), 'ether')
    });

    if (result.events && result.events.Failure) {
        const errorCode = result.events.Failure.returnValues.error;
        console.error(`repayBorrow error, code ${errorCode}`);
        process.exit(1);
    }

    console.log(`\nBorrow repaid.\n`);

    return result;
};

repayETH().catch(async (err) => {
    console.error('ERROR:', err);
    return err;
});
