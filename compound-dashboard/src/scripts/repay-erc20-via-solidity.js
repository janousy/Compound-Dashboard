// Example to borrow DAI (or any ERC20 token) using ETH as collateral
// from a Solidity smart contract

const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');
const {
    cEthAbi,
    cErcAbi,
    erc20Abi,
} = require('./contracts/contracts.json');

// Your Ethereum wallet private key
const privateKey = 'b8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add('0x' + privateKey);
const myWalletAddress = web3.eth.accounts.wallet[0].address;

// Mainnet Contract for cETH (the collateral-supply process is different for cERC20 tokens)
const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';
const cEth = new web3.eth.Contract(cEthAbi, cEthAddress);

// Mainnet Contract for the Comptroller & Open Price Feed
const comptrollerAddress = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b';
const priceFeedAddress = '0x6d2299c48a8dd07a872fdd0f8233924872ad1071';

// Mainnet address of underlying token (like DAI or USDC)
const underlyingAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // Dai
const underlying = new web3.eth.Contract(erc20Abi, underlyingAddress);

// Mainnet address for a cToken (like cDai, https://compound.finance/docs#networks)
const cTokenAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'; // cDai
const cToken = new web3.eth.Contract(cErcAbi, cTokenAddress);
const assetName = 'DAI'; // for the log output lines
const underlyingDecimals = 18; // Number of decimals defined in this ERC20 token's contract

// MyContract
const borrowContractAbi = require('./contracts/CompoundBorrow.json').abi;
const borrowContractAddress = '0xEcA3eDfD09435C2C7D2583124ca9a44f82aF1e8b';
const borrowContract = new web3.eth.Contract(borrowContractAbi, borrowContractAddress);

const logBalances = () => {
    return new Promise(async (resolve, reject) => {
        let myWalletEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
        let myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(borrowContractAddress));
        let myContractCEthBalance = await cEth.methods.balanceOf(borrowContractAddress).call() / 1e8;
        let myContractUnderlyingBalance = +await underlying.methods.balanceOf(borrowContractAddress).call() / Math.pow(10, underlyingDecimals);

        console.log("My Wallet's   ETH Balance:", myWalletEthBalance);
        console.log("BorrowContract's  ETH Balance:", myContractEthBalance);
        console.log("BorrowContract's cETH Balance:", myContractCEthBalance);
        console.log(`BorrowContract's  ${assetName} Balance:`, myContractUnderlyingBalance);

        resolve();
    });
};

export async function repayErc20(underlyingToRepayBorrow = 10) {
    console.log(`\nCalling CompoundBorrow with ${underlyingToRepayBorrow} Erc20 for repay...\n`);
    const contractIsDeployed = (await web3.eth.getCode(borrowContractAddress)) !== '0x';
    if (!contractIsDeployed) {
        throw Error('Compound BorrowContract is not deployed! Deploy it by running the deploy script.');
    }
    await logBalances();

    //const underlyingToRepayBorrow = 10;
    let result = await borrowContract.methods.myErc20RepayBorrow(
        underlyingAddress,
        cTokenAddress,
        (underlyingToRepayBorrow * Math.pow(10, underlyingDecimals)).toString()
    ).send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(5000000),
        gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
    });

    await logBalances();
    return result;
};

repayErc20().catch(async (err) => {
    console.error('ERROR:', err);
    // Create "events" and "emit" them in your Solidity code.
    // Current contract does not have any.
    let logs = await borrowContract.getPastEvents('allEvents');
    console.log('Logs: ', logs);
    return err;
});
