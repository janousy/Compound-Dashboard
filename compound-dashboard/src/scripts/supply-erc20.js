import {ADDRESSES} from "../const/addresses";

const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

// `myContractAddress` is logged when running the deploy script in the root
// directory of the project. Run the deploy script prior to running this one.
const supplyContractAddress = ADDRESSES.supplyContractAddress;
const supplyAbi = require('./contracts/CompoundSupply').abi;
const supplyContract = new web3.eth.Contract(supplyAbi, supplyContractAddress);

// Mainnet address for a cToken (like cDai, https://compound.finance/docs#networks)
const cTokenAddress = ADDRESSES.cTokenAddress;
const CErc20Abi = require('./contracts/contracts.json').cErcAbi;
const cTokenContract = new web3.eth.Contract(CErc20Abi, cTokenAddress);

const underlyingAddress = ADDRESSES.underlyingAddress;
const Erc20Abi = require('./contracts/contracts.json').erc20Abi;
const underlyingContract = new web3.eth.Contract(Erc20Abi, underlyingAddress);
const underlyingDecimals = 18;


export async function supplyErc20(amountToSupply) {
    if (!amountToSupply) {
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

    let transferResult = await underlyingContract.methods.transfer(
        supplyContractAddress,
        web3.utils.toHex(amountToSupply * Math.pow(10, underlyingDecimals))
    ).send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(500000),
        gasPrice: web3.utils.toHex(20000000000)
    });

    // Mint some cERC20 by sending ERC20 to the Compound Protocol
    let result = await supplyContract.methods.supplyErc20ToCompound(
        underlyingAddress,
        cTokenAddress,
        web3.utils.toHex(amountToSupply * Math.pow(10, underlyingDecimals))
    ).send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(500000),
        gasPrice: web3.utils.toHex(20000000000)
    });

    console.log('Supplied ERC20 to Compound via Supply Contract');

    return result;
}

supplyErc20().catch(async (err) => {
    console.error('Error: ', err);
    const logs = await supplyContract.getPastEvents('allEvents');
    console.error('Logs: ', logs);
    return err;
});

export default supplyErc20();