import { getWeb3Instance } from "./utils";
import { ADDRESSES } from "../const/addresses";
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
    console.log(`\nCalling CompoundSupply with ${amountToRedeem} Erc20 for redeem...\n`);

    if (!amountToRedeem) {
        console.log("Invalid parameter(s)");
        return;
    }

    const {
        cErcAbi,
    } = require('./contracts/contracts.json');

    const web3 = getWeb3Instance();
    const supplyContract = new web3.eth.Contract(supplyContractAbi, ADDRESSES.supplyContractAddress);
    const cErc20 = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);

    const { ethereum } = window;
    await ethereum.request({ method: 'eth_requestAccounts' });
    let myWalletAddress = await ethereum.request({method: 'eth_accounts'});
    myWalletAddress = myWalletAddress[0];

    const contractIsDeployed = (await web3.eth.getCode(ADDRESSES.supplyContractAddress)) !== '0x';
    if (!contractIsDeployed) {
        throw Error('SupplyContract is not deployed! Deploy it by running the deploy script.');
    }

    await logBalances(web3, myWalletAddress, cErc20);

    let result = await supplyContract.methods.redeemCErc20Tokens(
        web3.utils.toHex(amountToRedeem),
        true,
        ADDRESSES.cTokenAddress
    ).send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(500000),
        gasPrice: web3.utils.toHex(20000000000)
    });

    await logBalances(web3, myWalletAddress, cErc20);

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
