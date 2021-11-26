import { getWeb3Instance } from "./utils";
import { ADDRESSES } from "../const/addresses";
import { abi as supplyContractAbi } from "./contracts/CompoundSupply";

const logBalances = (web3, myWalletAddress, cEth) => {
    return new Promise(async (resolve, reject) => {
        let myWalletEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
        let myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(ADDRESSES.supplyContractAddress));
        let myContractCEthBalance = await cEth.methods.balanceOf(ADDRESSES.supplyContractAddress).call() / 1e8;

        console.log("My Wallet's   ETH Balance:", myWalletEthBalance);
        console.log("MyContract's  ETH Balance:", myContractEthBalance);
        console.log("MyContract's cETH Balance:", myContractCEthBalance);

        resolve();
    });
};

export async function supplyEth(amountToSupply) {
    console.log(`\nCalling supplyEth with ${amountToSupply} ETH for supply...\n`);

    if (!amountToSupply) {
        console.log("Invalid parameter(s)");
        return;
    }

    const {
        cEthAbi,
    } = require('./contracts/contracts.json');

    const web3 = getWeb3Instance();
    const supplyContract = new web3.eth.Contract(supplyContractAbi, ADDRESSES.supplyContractAddress);
    const cEth = new web3.eth.Contract(cEthAbi, ADDRESSES.cEthAddress);

    const { ethereum } = window;
    await ethereum.request({ method: 'eth_requestAccounts' });
    let myWalletAddress = await ethereum.request({ method: 'eth_accounts' });
    myWalletAddress = myWalletAddress[0];

    // Mint some cETH by supplying ETH to the Compound Protocol
    let result = await cEth.methods.mint().send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(250000),
        gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
        value: web3.utils.toHex(web3.utils.toWei(amountToSupply.toString(), 'ether'))
    });

    return result;
}

supplyEth().catch(async (err) => {
    console.error('Error: ', err);
    const web3 = getWeb3Instance();
    const supplyContract = new web3.eth.Contract(supplyContractAbi, ADDRESSES.supplyContractAddress);
    const logs = await supplyContract.getPastEvents('allEvents');
    //console.log('Logs: ', logs);
    return err;
});
