// Example to supply DAI as collateral and borrow ETH
// YOU MUST HAVE DAI IN YOUR WALLET before you run this script
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

// Mainnet Contract for the Comptroller
const comptrollerAddress = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b';

// Mainnet Contract for cETH
const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';
const cEth = new web3.eth.Contract(cEthAbi, cEthAddress);

// Mainnet address of underlying token (like DAI or USDC)
const underlyingAddress = '0x6b175474e89094c44da98b954eedeac495271d0f'; // Dai
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

// Web3 transaction information, we'll use this for every transaction we'll send
const fromMyWallet = {
    from: myWalletAddress,
    gasLimit: web3.utils.toHex(4000000),
    gasPrice: web3.utils.toHex(25000000000) // use ethgasstation.info (mainnet only)
};

const logBalances = () => {
    return new Promise(async (resolve, reject) => {
        const myWalletUnderlyingBalance = +await underlying.methods.balanceOf(myWalletAddress).call() / 1e18;
        const myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(borrowContractAddress));
        const myContractCEthBalance = await cEth.methods.balanceOf(borrowContractAddress).call() / 1e8;
        const myContractUnderlyingBalance = +await underlying.methods.balanceOf(borrowContractAddress).call() / 1e18;
        const myContractCTokenBalance = +await cToken.methods.balanceOf(borrowContractAddress).call() / 1e8;

        console.log(`My Wallet's   ${assetName} Balance:`, myWalletUnderlyingBalance);
        console.log(`BorrowContract's  ETH Balance:`, myContractEthBalance);
        console.log(`BorrowContract's cETH Balance:`, myContractCEthBalance);
        console.log(`BorrowContract's  ${assetName} Balance:`, myContractUnderlyingBalance);
        console.log(`BorrowContract's c${assetName} Balance:`, myContractCTokenBalance);

        resolve();
    });
};

export async function repayETH(ethToRepayBorrow = 0.002) {
    console.log(`\nCalling CompoundBorrow with ${ethToRepayBorrow} ETH for repay...\n`);
    const contractIsDeployed = (await web3.eth.getCode(borrowContractAddress)) !== '0x';
    if (!contractIsDeployed) {
        throw Error('MyContract is not deployed! Deploy it by running the deploy script.');
    }
    await logBalances();

    //const ethToRepayBorrow = 0.002; // hard coded borrow in contract
    let result = await borrowContract.methods.myEthRepayBorrow(
        cEthAddress,
        web3.utils.toWei(ethToRepayBorrow.toString(), 'ether'),
        300000 // gas for the "cEth.repayBorrow" function
    ).send(fromMyWallet);

    await logBalances();
    return result;
};

repayETH().catch(
    console.error
);
