import React from "react";
import {Tabs, Tab, Row, Col, Container, Card, Button} from "react-bootstrap";
import '../../Styles/Molecules/Supply.css';
import Web3 from "web3";
import {cErcAbi, cEthAbi, erc20Abi} from "../../scripts/contracts/contracts.json";
import {abi as borrowContractAbi} from "../../scripts/contracts/CompoundBorrow.json";
import { FaBeer } from 'react-icons/fa';
import { ImSpinner11 } from "react-icons/im";

class UserStats extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            totalETHSupply: 0,
            totalETHBorrow: 0,
            totalErc20Supply: 0,
            totalErc20Borrow: 0,
        }
        this.getEthMarket.bind(this)
    }

    componentDidUpdate() {
        this.getEthMarket().then();
    }

    componentDidMount() {
    }

    handleRefreshMarkets() {
        this.getEthMarket().then();
    }

    toScientific(x, f) {
        return Number.parseFloat(x).toExponential(f);
    }

    async getEthMarket() {
        // Example to supply DAI as collateral and borrow ETH
// YOU MUST HAVE DAI IN YOUR WALLET before you run this script
        const Web3 = require('web3');
        const web3 = new Web3('http://127.0.0.1:8545');
        const {
            cEthAbi,
            cErcAbi,
            erc20Abi,
        } = require("../../scripts/contracts/contracts.json");

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
        //const borrowContractAbi = require('./contracts/CompoundBorrow.json').abi;
        const borrowContractAddress = '0xEcA3eDfD09435C2C7D2583124ca9a44f82aF1e8b';
        const borrowContract = new web3.eth.Contract(borrowContractAbi, borrowContractAddress);

        // Web3 transaction information, we'll use this for every transaction we'll send
        const fromMyWallet = {
            from: myWalletAddress,
            gasLimit: web3.utils.toHex(4000000),
            gasPrice: web3.utils.toHex(25000000000) // use ethgasstation.info (mainnet only)
        };

        const myWalletUnderlyingBalance = +await underlying.methods.balanceOf(myWalletAddress).call() / 1e18;
        const myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(borrowContractAddress));
        const myContractCEthBalance = await cEth.methods.balanceOf(borrowContractAddress).call() / 1e8;
        const myContractUnderlyingBalance = +await underlying.methods.balanceOf(borrowContractAddress).call() / 1e18;
        const myContractCTokenBalance = +await cToken.methods.balanceOf(borrowContractAddress).call() / 1e8;

        this.setState({
            totalETHSupply: myContractEthBalance,
            totalETHBorrow: myContractCEthBalance,
            totalErc20Supply: myContractUnderlyingBalance,
            totalErc20Borrow: myContractCTokenBalance,
        })

        console.log(`My Wallet's   ${assetName} Balance:`, myWalletUnderlyingBalance);
        console.log(`RepayContract's  ETH Balance:`, myContractEthBalance);
        console.log(`RepayContract's cETH Balance:`, myContractCEthBalance);
        console.log(`RepayContract's  ${assetName} Balance:`, myContractUnderlyingBalance);
        console.log(`RepayContract's c${assetName} Balance:`, myContractCTokenBalance);
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col sm={10}><div className="Title mb-4">Your Assets</div></Col>
                    <Col sm={2}><Button variant="light" onClick={this.handleRefreshMarkets}><ImSpinner11/></Button></Col>
                </Row>
                <Tabs defaultActiveKey="uzheth" id="uncontrolled-tab-example" className="mb-3">
                    <Tab eventKey="uzheth" title="UZHETH">
                        <Card>
                            <Container>
                                <Row>
                                    <Col>Total Supply</Col>
                                    <Col>Total Borrow</Col>
                                </Row>
                                <Row>
                                    <Col>{this.state.totalErc20Supply}</Col>
                                    <Col>{this.state.totalETHBorrow}</Col>
                                </Row>
                            </Container>
                        </Card>
                    </Tab>
                    <Tab eventKey="erc20" title="ERC20">
                        <p>ERC20</p>
                    </Tab>
                </Tabs>
            </Container>
        )
    }
}

export default UserStats;