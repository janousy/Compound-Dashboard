import { getWeb3Instance } from "./utils";
import { ADDRESSES } from "../const/addresses";
import { abi as supplyContractAbi } from "./contracts/CompoundSupply";

const logBalances = (web3, myWalletAddress, cEth) => {
    return new Promise(async (resolve, reject) => {
        let myWalletEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
        let myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(ADDRESSES.supplyContractAddress));
        let myContractCEthBalance = await cEth.methods.balanceOf(ADDRESSES.supplyContractAddress).call() / 1e8;

        const assetName = 'DAI'; // for the log output lines

        console.log("My Wallet's   ETH Balance:", myWalletEthBalance);
        console.log("MyContract's  ETH Balance:", myContractEthBalance);
        console.log("MyContract's cETH Balance:", myContractCEthBalance);

        resolve();
    });
};

export async function redeemEth(amountToRedeem) {
    console.log(`\nCalling CompoundSupply with ${amountToRedeem} ETH for redeem...\n`);

    if (!amountToRedeem) {
        console.log("Invalid parameter(s)");
        return;
    }

    const {
        cEthAbi,
    } = require('./contracts/contracts.json');

    const web3 = getWeb3Instance();
    const supplyContract = new web3.eth.Contract(supplyContractAbi, ADDRESSES.supplyContractAddress);
    const cEth = new web3.eth.Contract(cEthAbi, ADDRESSES.cEthAddress);

    const contractIsDeployed = (await web3.eth.getCode(ADDRESSES.supplyContractAddress)) !== '0x';
    if (!contractIsDeployed) {
        throw Error('SupplyContract is not deployed! Deploy it by running the deploy script.');
    }

    const { ethereum } = window;
    await ethereum.request({ method: 'eth_requestAccounts' });
    let myWalletAddress = await ethereum.request({method: 'eth_accounts'});
    myWalletAddress = myWalletAddress[0];

    await logBalances(web3, myWalletAddress, cEth);

    let result = await supplyContract.methods.redeemCEth(
        web3.utils.toHex(amountToRedeem),
        true,
        ADDRESSES.cEthAddress
    ).send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(750000),
        gasPrice: web3.utils.toHex(20000000000),
    });

    await logBalances(web3, myWalletAddress, cEth);

    return result;
}

redeemEth().catch(async (err) => {
    console.error('Error: ', err);
    const web3 = getWeb3Instance();
    const supplyContract = new web3.eth.Contract(supplyContractAbi, ADDRESSES.supplyContractAddress);
    const logs = await supplyContract.getPastEvents('allEvents');
    //console.log('Logs: ', logs);
    return err;
});
