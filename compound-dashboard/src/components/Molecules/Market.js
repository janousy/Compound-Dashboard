import React from "react";
import { Tabs, Tab, Row, Col, Button } from "react-bootstrap";
import '../../Styles/Molecules/Stats.css';
import { ImSpinner11 } from "react-icons/im";
import { getBorrowMarketStats, getCollateralFactors, getExchangeRates, getSupplyMarketStats } from "../../scripts/utils";
import { ADDRESSES } from "../../const/addresses";

class Market extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            EthSupply: 0,
            TokenSupply: 0,
            EthBorrows: 0,
            TokenBorrows: 0,
            cEthExchangeRate: 0,
            cErc20ExchangeRate: 0,
            cEtherCollateralFactor: 0,
            cErc20CollateralFactor: 0,
        }
    }

    componentDidMount() {
    }

    async handleRefreshMarkets() {
        const {
            cEthAbi,
            cErcAbi,
            erc20Abi,
            comptrollerAbi,
        } = require("../../scripts/contracts/contracts.json");

        let supplyResults = await getSupplyMarketStats(cEthAbi, cErcAbi, erc20Abi);
        let borrowResults = await getBorrowMarketStats(cEthAbi, cErcAbi, erc20Abi);
        let exchangeRates = await getExchangeRates(cEthAbi, cErcAbi, erc20Abi);

        const cEthExchangeRate = exchangeRates.cEthExchangeRate;
        const cErc20ExchangeRate = exchangeRates.cErc20ExchangeRate;

        let ethSupply = supplyResults.cEthSupply * cEthExchangeRate;
        let tokenSupply = supplyResults.cTokenSupply * cErc20ExchangeRate;

        let ethBorrows = borrowResults.cEthBorrows * cEthExchangeRate
        let tokenBorrows = borrowResults.cTokenBorrows * cErc20ExchangeRate;

        let cEtherCollateralFactor = await getCollateralFactors(comptrollerAbi, ADDRESSES.cEthAddress, 18);
        let cErc20CollateralFactor = await getCollateralFactors(comptrollerAbi, ADDRESSES.cTokenAddress, 18);

        this.setState((state) => ({
            EthSupply: ethSupply,
            TokenSupply: tokenSupply,
            EthBorrows: ethBorrows,
            TokenBorrows: tokenBorrows,
            cEthExchangeRate: cEthExchangeRate,
            cErc20ExchangeRate: cErc20ExchangeRate,
            cEtherCollateralFactor: cEtherCollateralFactor,
            cErc20CollateralFactor: cErc20CollateralFactor
        }));
    }

    render() {
        return (
            <div className="StatsComponent">
                <Row className="position-relative">
                    <div className="Title mb-4 p-0">Markets</div>
                    <Button className="ButtonStats" variant="primary" onClick={this.handleRefreshMarkets.bind(this)}>
                        <ImSpinner11 />
                    </Button>
                </Row>
                <Row>
                    <div className="BoxContainerUser">
                        <Tabs defaultActiveKey="uzheth" id="uncontrolled-tab-example" className="mb-3">
                            <Tab eventKey="uzheth" title="UZHETH">
                                <Row className="pb-3">
                                    <Col className="ps-4">
                                        <div>
                                            <h6>Total Supply</h6>
                                        </div>
                                        <div>
                                            {this.state.EthSupply} UZHETH
                                        </div>
                                    </Col>
                                    <Col>
                                        <div>
                                            <h6>Total Borrow</h6>
                                        </div>
                                        <div>
                                            {this.state.EthBorrows} UZHETH
                                        </div>
                                    </Col>
                                    <hr
                                        style={{
                                            color: "black",
                                            backgroundColor: "black",
                                            height: 1
                                        }}
                                    />
                                    <div>
                                        ExchangeRate cETH to ETH: {this.state.cEthExchangeRate.toFixed(4)}
                                    </div>
                                    <div>
                                        CollateralFactor: {this.state.cEtherCollateralFactor.toFixed(4)}
                                    </div>
                                </Row>
                            </Tab>
                            <Tab eventKey="erc20" title="ERC20">
                                <Row className="pb-3">
                                    <Col className="ps-4">
                                        <div>
                                            <h6>Total Supply</h6>
                                        </div>
                                        <div>
                                            {this.state.TokenSupply} ERC20
                                        </div>
                                    </Col>
                                    <Col>
                                        <div>
                                            <h6>Total Borrow</h6>
                                        </div>
                                        <div>
                                            {this.state.TokenBorrows} ERC20
                                        </div>
                                    </Col>
                                    <hr
                                        style={{
                                            color: "black",
                                            backgroundColor: "black",
                                            height: 1
                                        }}
                                    />
                                    <div>
                                        ExchangeRate cErc20 to Erc20: {this.state.cErc20ExchangeRate.toFixed(4)}
                                    </div>
                                    <div>
                                        CollateralFactor: {this.state.cErc20CollateralFactor.toFixed(4)}
                                    </div>
                                </Row>
                            </Tab>
                        </Tabs>
                    </div>
                </Row>
            </div>
        )
    }
}

export default Market;