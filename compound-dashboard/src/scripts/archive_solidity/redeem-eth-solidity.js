import { ADDRESSES } from "../const/addresses";

const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

// `myContractAddress` is logged when running the deploy script in the root
// directory of the project. Run the deploy script prior to running this one.
const supplyContractAddress = ADDRESSES.supplyContractAddress;
const supplyAbi = require('./contracts/CompoundSupply').abi;
const supplyContract = new web3.eth.Contract(supplyAbi, supplyContractAddress);

// Main net contract address and ABI for cETH, which can be found in the mainnet
const compoundCEthContractAddress = ADDRESSES.cEthAddress;
const compoundCEthContractAbi = require('./contracts/contracts.json').cEthAbi;
const compoundCEthContract = new web3.eth.Contract(compoundCEthContractAbi, compoundCEthContractAddress);


export async function redeemEth(amountToRedeem) {
    if (!amountToRedeem) {
        return;
    }
    const Web3 = require('web3');
    const web3 = new Web3('http://localhost:8545');

    const { ethereum } = window;
    await ethereum.request({ method: 'eth_requestAccounts' });
    let myWalletAddress = await ethereum.request({method: 'eth_accounts'});
    myWalletAddress = myWalletAddress[0];

    const contractIsDeployed = (await web3.eth.getCode(supplyContractAddress)) !== '0x';

    if (!contractIsDeployed) {
        throw Error('SupplyContract is not deployed! Deploy it by running the deploy script.');
    }

    let result = await supplyContract.methods.redeemCEth(
        web3.utils.toHex(amountToRedeem),
        true,
        compoundCEthContractAddress
    ).send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(750000),
        gasPrice: web3.utils.toHex(20000000000),
    });

    console.log('Redeemed ETH to Compound via MyContract');
    return result;
}

redeemEth().catch(async (err) => {
    console.error('Error: ', err);
    const logs = await supplyContract.getPastEvents('allEvents');
    console.error('Logs: ', logs);
    return err;
});
