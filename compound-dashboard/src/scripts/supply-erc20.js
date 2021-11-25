import { getWeb3Instance } from "./utils";
import { ADDRESSES } from "../const/addresses";
import { abi as supplyContractAbi } from "./contracts/CompoundSupply";

const logBalances = (web3, myWalletAddress, underlying, underlyingDecimals) => {
    return new Promise(async (resolve, reject) => {
        // TODO do not need eth but dai balance
        let myWalletEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
        let myContractUnderlyingBalance = +await underlying.methods.balanceOf(ADDRESSES.supplyContractAddress).call() / Math.pow(10, underlyingDecimals);
        let myContractCUnderlyingBalance = +await underlying.methods.balanceOf(ADDRESSES.supplyContractAddress).call() / Math.pow(10, underlyingDecimals);


        const assetName = 'DAI'; // for the log output lines

        console.log("My Wallet's   ETH Balance:", myWalletEthBalance);
        console.log("MyContract's  ETH Balance:", myContractEthBalance);
        console.log(`MyContract's  ${assetName} Balance:`, myContractUnderlyingBalance);

        resolve();
    });
};

export async function supplyErc20(amountToSupply) {
    console.log(`\nCalling CompoundSupply with ${amountToSupply} ERC20 for supply...\n`);

    if (!amountToSupply) {
        console.log("Invalid parameter(s)");
        return;
    }

    const {
        erc20Abi,
    } = require('./contracts/contracts.json');

    const web3 = getWeb3Instance();
    const supplyContract = new web3.eth.Contract(supplyContractAbi, ADDRESSES.supplyContractAddress);
    const underlying = new web3.eth.Contract(erc20Abi, ADDRESSES.underlyingAddress);

    const contractIsDeployed = (await web3.eth.getCode(ADDRESSES.supplyContractAddress)) !== '0x';
    if (!contractIsDeployed) {
        throw Error('SupplyContract is not deployed! Deploy it by running the deploy script.');
    }

    const { ethereum } = window;
    await ethereum.request({ method: 'eth_requestAccounts' });
    let myWalletAddress = await ethereum.request({method: 'eth_accounts'});
    myWalletAddress = myWalletAddress[0];

    const underlyingDecimals = 18; // Number of decimals defined in this ERC20 token's contract
    await logBalances(web3, myWalletAddress, underlying, underlyingDecimals);

    let transferResult = await underlying.methods.transfer(
        ADDRESSES.supplyContractAddress,
        web3.utils.toHex(amountToSupply * Math.pow(10, underlyingDecimals))
    ).send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(500000),
        gasPrice: web3.utils.toHex(20000000000)
    });

    // Mint some cERC20 by sending ERC20 to the Compound Protocol
    let result = await supplyContract.methods.supplyErc20ToCompound(
        ADDRESSES.underlyingAddress,
        ADDRESSES.cTokenAddress,
        web3.utils.toHex(amountToSupply * Math.pow(10, underlyingDecimals))
    ).send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(500000),
        gasPrice: web3.utils.toHex(20000000000)
    });

    await logBalances(web3, myWalletAddress, underlying, underlyingDecimals);

    return result;
}

supplyErc20().catch(async (err) => {
    console.error('Error: ', err);
    const web3 = getWeb3Instance();
    const supplyContract = new web3.eth.Contract(supplyContractAbi, ADDRESSES.supplyContractAddress);
    const logs = await supplyContract.getPastEvents('allEvents');
    //console.log('Logs: ', logs);
    return err;
});
