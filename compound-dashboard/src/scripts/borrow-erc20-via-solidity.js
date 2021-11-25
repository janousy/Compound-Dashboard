import {getWeb3Instance} from "./utils";
import {ADDRESSES} from "../const/addresses";
import {abi as borrowContractAbi} from "./contracts/CompoundBorrow.json";

const logBalances = (web3, myWalletAddress, cEth, underlying, underlyingDecimals) => {
    return new Promise(async (resolve, reject) => {
        let myWalletEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
        let myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(ADDRESSES.borrowContractAddress));
        let myContractCEthBalance = await cEth.methods.balanceOf(ADDRESSES.borrowContractAddress).call() / 1e8;
        let myContractUnderlyingBalance = +await underlying.methods.balanceOf(ADDRESSES.borrowContractAddress).call() / Math.pow(10, underlyingDecimals);

        const assetName = 'DAI'; // for the log output lines

        console.log("My Wallet's   ETH Balance:", myWalletEthBalance);
        console.log("MyContract's  ETH Balance:", myContractEthBalance);
        console.log("MyContract's cETH Balance:", myContractCEthBalance);
        console.log(`MyContract's  ${assetName} Balance:`, myContractUnderlyingBalance);

        resolve();
    });
};

export async function borrowErc20(numUnderlyingToBorrow, ethToSupplyAsCollateral) {
    console.log(`\nCalling CompoundBorrow with ${ethToSupplyAsCollateral} ETH for collateral...\n`);

    if (!numUnderlyingToBorrow || !ethToSupplyAsCollateral) {
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

    const contractIsDeployed = (await web3.eth.getCode(ADDRESSES.borrowContractAddress)) !== '0x';
    if (!contractIsDeployed) {
        throw Error('Compound BorrowContract is not deployed! Deploy it by running the deploy script.');
    }

    const { ethereum } = window;
    await ethereum.request({ method: 'eth_requestAccounts' });
    let myWalletAddress = await ethereum.request({method: 'eth_accounts'});
    myWalletAddress = myWalletAddress[0];

    const underlyingDecimals = 18; // Number of decimals defined in this ERC20 token's contract
    await logBalances(web3, myWalletAddress, cEth, underlying, underlyingDecimals);

    let result = await borrowContract.methods.borrowErc20Example(
        ADDRESSES.cEthAddress,
        ADDRESSES.comptrollerAddress,
        ADDRESSES.priceFeedAddress,
        ADDRESSES.cTokenAddress,
        underlyingDecimals,
        numUnderlyingToBorrow
    ).send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(5000000),
        gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
        value: (ethToSupplyAsCollateral * 1e18).toString()
    });

    await logBalances(web3, myWalletAddress, cEth, underlying, underlyingDecimals);

    return result;
};

borrowErc20().catch(async (err) => {
    console.error('ERROR:', err);
    const web3 = getWeb3Instance();
    const borrowContract = new web3.eth.Contract(borrowContractAbi, ADDRESSES.borrowContractAddress);
    let logs = await borrowContract.getPastEvents('allEvents');
    //console.log('Logs: ', logs);
    return err;
});