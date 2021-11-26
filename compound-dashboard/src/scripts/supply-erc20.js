import { getWalletAddress, getWeb3Instance } from "./utils";
import { ADDRESSES, ERC20 } from "../const/addresses";
import { abi as supplyContractAbi } from "./contracts/CompoundSupply";

const logBalances = (web3, myWalletAddress, underlying, underlyingDecimals) => {
    return new Promise(async (resolve, reject) => {
        // TODO do not need eth but dai balance
        let myWalletEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
        let myContractUnderlyingBalance = +await underlying.methods.balanceOf(ADDRESSES.supplyContractAddress).call() / Math.pow(10, underlyingDecimals);
        let myContractCUnderlyingBalance = +await underlying.methods.balanceOf(ADDRESSES.supplyContractAddress).call() / Math.pow(10, underlyingDecimals);

        const assetName = 'DAI'; // for the log output lines

        console.log("My Wallet's   ETH Balance:", myWalletEthBalance);
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
        cErcAbi,
    } = require('./contracts/contracts.json');

    const web3 = getWeb3Instance();
    const supplyContract = new web3.eth.Contract(supplyContractAbi, ADDRESSES.supplyContractAddress);
    const underlyingContract = new web3.eth.Contract(erc20Abi, ADDRESSES.underlyingAddress);
    const cErc20Contract = new web3.eth.Contract(cErcAbi, ADDRESSES.cTokenAddress);

/*     const contractIsDeployed = (await web3.eth.getCode(ADDRESSES.supplyContractAddress)) !== '0x';
    if (!contractIsDeployed) {
        throw Error('SupplyContract is not deployed! Deploy it by running the deploy script.');
    } */

    const myWalletAddress = await getWalletAddress();
    const fromMyWallet = {
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(500000),
        gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
      };

    const underlyingDecimals = 18; // Number of decimals defined in this ERC20 token's contract
    await logBalances(web3, myWalletAddress, underlyingContract, underlyingDecimals);

    const underlyingTokensToSupply = amountToSupply * Math.pow(10, underlyingDecimals);

    // Tell the contract to allow 10 tokens to be taken by the cToken contract
    await underlyingContract.methods.approve(
      ADDRESSES.cTokenAddress, web3.utils.toBN(underlyingTokensToSupply)
    ).send(fromMyWallet);
  
    console.log(`${ERC20.name} contract "Approve" operation successful.`);
    console.log(`Supplying ${ERC20.name} to the Compound Protocol...`, '\n');
  
    // Mint cTokens by supplying underlying tokens to the Compound Protocol
    let result = await cErc20Contract.methods.mint(
      web3.utils.toBN(underlyingTokensToSupply.toString())
    ).send(fromMyWallet);

    console.log(`c${ERC20.name} "Mint" operation successful.`, '\n');

    const balanceOfUnderlying = web3.utils.toBN(await cErc20Contract.methods
        .balanceOfUnderlying(myWalletAddress).call()) / Math.pow(10, underlyingDecimals);
    
    console.log(`${ERC20.name} supplied to the Compound Protocol:`, balanceOfUnderlying, '\n');

/*     let transferResult = await underlying.methods.transfer(
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
    }); */

    await logBalances(web3, myWalletAddress, underlyingContract, underlyingDecimals);

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
