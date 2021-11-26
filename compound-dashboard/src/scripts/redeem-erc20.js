import { getWalletAddress, getWeb3Instance } from "./utils";
import { ADDRESSES, ERC20 } from "../const/addresses";
import { abi as supplyContractAbi } from "./contracts/CompoundSupply";

const logBalances = (web3, myWalletAddress, cErc20) => {
    return new Promise(async (resolve, reject) => {
        // TODO exchange logs
        let myWalletEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
        let myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(ADDRESSES.supplyContractAddress));
        let myContractCErc20Balance = await cErc20.methods.balanceOf(ADDRESSES.supplyContractAddress).call() / 1e8;

        console.log("My Wallet's   ETH Balance:", myWalletEthBalance);
        console.log("MyContract's  ETH Balance:", myContractEthBalance);
        console.log("MyContract's cErc20 Balance:", myContractCErc20Balance);

        resolve();
    });
};

export async function redeemErc20(amountToRedeem) {
    console.log(`\nCalling redeemErc20 with ${amountToRedeem} Erc20 for redeem...\n`);

    if (!amountToRedeem) {
        console.log("Invalid parameter(s)");
        return;
    }

    const {
        cErcAbi,
    } = require('./contracts/contracts.json');

    const web3 = getWeb3Instance();
    const supplyContract = new web3.eth.Contract(supplyContractAbi, ADDRESSES.supplyContractAddress);
    const cErc20Contract = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);

    let myWalletAddress = await getWalletAddress();
    const fromMyWallet = {
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(500000),
        gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
      };

    let cTokenBalance = await cErc20Contract.methods.balanceOf(myWalletAddress).call() / 1e8;
    if (amountToRedeem > cTokenBalance) {
        throw Error('Error! Cannot redeem more than current cToken balance: ', cTokenBalance)
    }

    // redeem (based on cTokens)
    console.log('Redeeming the cErc20 for Erc20...', '\n');
    console.log(`Exchanging all c${ERC20.name} based on cToken amount...`, '\n');
    let result = await cErc20Contract.methods.redeem(amountToRedeem * 1e8).send(fromMyWallet);
    console.log('Redeeming successfull...', '\n');

    return result;
}

redeemErc20().catch(async (err) => {
    console.error('Error: ', err);
    const web3 = getWeb3Instance();
    const supplyContract = new web3.eth.Contract(supplyContractAbi, ADDRESSES.supplyContractAddress);
    const logs = await supplyContract.getPastEvents('allEvents');
    //console.log('Logs: ', logs);
    return err;
});
