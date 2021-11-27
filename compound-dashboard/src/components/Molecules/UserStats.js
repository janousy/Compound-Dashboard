import React from "react";
import { Row, Button, ListGroup } from "react-bootstrap";
import '../../Styles/Molecules/Stats.css';
import { ImSpinner11 } from "react-icons/im";
import { getUserAssets, getUserBorrows, getExchangeRates, getAccountLiquidity } from "../../scripts/utils";

class UserStats extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ethBalance: 0,
            cEthBalance: 0,
            erc20Balance: 0,
            cErc20Balance: 0,
            ethBorrow: 0,
            erc20Borrow: 0,
            ethSupply: 0,
            erc20Supply: 0,
            userLiquidity: 0,
        };

        const decimals = 2;
    }

    componentDidMount() {
    }

    async handleRefreshDetails() {
        console.log('Reloading user statistics')

        const {
            cEthAbi,
            cErcAbi,
            erc20Abi,
            comptrollerAbi,
        } = require("../../scripts/contracts/contracts.json");

        let userStats = await getUserAssets(cEthAbi, cErcAbi, erc20Abi);

        let liquidity = await getAccountLiquidity(comptrollerAbi);

        let userBorrows = await getUserBorrows(cEthAbi, cErcAbi, erc20Abi);
        let cEthBorrowBalance = userBorrows.cEthBorrowBalance;
        let cErc20BorrowBalance = userBorrows.cErc20BorrowBalance;

        let exchangeRates = await getExchangeRates(cEthAbi, cErcAbi, erc20Abi);
        const cEthExchangeRate = exchangeRates.cEthExchangeRate;
        const cErc20ExchangeRate = exchangeRates.cErc20ExchangeRate;

        let userEthBorrow = cEthBorrowBalance;
        let userErc20Borrow = cErc20BorrowBalance;

        this.setState((state) => ({
            ethBalance: userStats.ethBalance,
            cEthBalance: userStats.cEthBalance,
            erc20Balance: userStats.erc20Balance,
            cErc20Balance: userStats.cErc20Balance,
            ethBorrow: userEthBorrow,
            erc20Borrow: userErc20Borrow,
            userLiquidity: liquidity,
        }));
    }

    render() {
        return (
            <div className="StatsComponent">
                <Row className="position-relative">
                    <div className="Title mb-4 p-0">Your Assets</div>
                    <Button className="ButtonStats" variant="primary" onClick={this.handleRefreshDetails.bind(this)}>
                        <ImSpinner11 />
                    </Button>
                </Row>
                <Row>
                    <div className="BoxContainerUser">
                        <ListGroup variant='flush'>
                            <h6>Assets</h6>
                            <ListGroup.Item>
                                <div className="d-flex flex-row justify-content-between">
                                    <p>UZHETH</p>
                                    <p>{this.state.ethBalance.toFixed(2)}</p>
                                </div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="d-flex flex-row justify-content-between">
                                    <p>cUZHETH</p>
                                    <p>{this.state.cEthBalance.toFixed(2)}</p>
                                </div>
                            </ListGroup.Item>                            
                            <ListGroup.Item>
                                <div className="d-flex flex-row justify-content-between">
                                    <p>ERC20</p>
                                    <p>{this.state.erc20Balance.toFixed(2)}</p>
                                </div>
                            </ListGroup.Item>                            
                            <ListGroup.Item>
                                <div className="d-flex flex-row justify-content-between">
                                    <p>cErc20</p>
                                    <p>{this.state.cErc20Balance.toFixed(2)}</p>
                                </div>
                            </ListGroup.Item>
                        </ListGroup>
                        <h6>Borrows</h6>
                        <ListGroup variant='flush'>
                            <ListGroup.Item>
                                <div className="d-flex flex-row justify-content-between">
                                    <p>UZHETH Borrow</p>
                                    <p>{this.state.ethBorrow.toFixed(2)}</p>
                                </div>
                            </ListGroup.Item>                        
                            <ListGroup.Item>
                                <div className="d-flex flex-row justify-content-between">
                                    <p>ERC20 Borrow</p>
                                    <p>{this.state.erc20Borrow.toFixed(2)}</p>
                                </div>
                            </ListGroup.Item>                            
                            <ListGroup.Item>
                                <div className="d-flex flex-row justify-content-between">
                                    <p>Liquidity in USD</p>
                                    <p>{this.state.userLiquidity.toFixed(this.decimals)}</p>
                                </div>
                            </ListGroup.Item>
                        </ListGroup>
                    </div>
                </Row>
            </div>
        )
    }
}

export default UserStats;