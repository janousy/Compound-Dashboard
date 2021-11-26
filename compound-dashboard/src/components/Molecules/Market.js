import React from "react";
import { Tabs, Tab, Row, Col, Button } from "react-bootstrap";
import '../../Styles/Molecules/Stats.css';
import { cErcAbi, cEthAbi, erc20Abi } from "../../scripts/contracts/contracts.json";
import { ImSpinner11 } from "react-icons/im";
import { getBorrowMarketStats, getCollateralFactors, getExchangeRates, getSupplyMarketStats } from "../../scripts/utils";
import { ADDRESSES } from "../../const/addresses";

class Market extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cEthSupply: 0,
            cTokenSupply: 0,
            cEthBorrows: 0,
            cTokenBorrows: 0,
            cEthExchangeRate: 0,
            cErc20ExchangeRate: 0,
            cEtherCollateralFactor: 0,
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

        let resultBorrow = await getBorrowMarketStats(cEthAbi, cErcAbi, erc20Abi);
        let resultSupply = await getSupplyMarketStats(cEthAbi, cErcAbi, erc20Abi);
        let exchangeRates = await getExchangeRates(cEthAbi, cErcAbi, erc20Abi);

        let cEtherCollateralFactor = await getCollateralFactors(comptrollerAbi, ADDRESSES.cEthAddress, 18);
        let cErc20CollateralFactor = await getCollateralFactors(comptrollerAbi, ADDRESSES.cTokenAddress, 18);

        this.setState((state) => ({
            cEthSupply: resultSupply.cEthSupply,
            cTokenSupply: resultSupply.cTokenSupply,
            cEthBorrows: resultBorrow.cEthBorrows,
            cTokenBorrows: resultBorrow.cTokenBorrows,
            cEthExchangeRate: exchangeRates.cEthExchangeRate,
            cErc20ExchangeRate: exchangeRates.erc20ExchangeRate,
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
                                            <h6>Total Borrow</h6>
                                        </div>
                                        <div>
                                            {this.state.cEthSupply} cUZHETH
                                        </div>
                                    </Col>
                                    <Col>
                                        <div>
                                            <h6>Total Borrow</h6>
                                        </div>
                                        <div>
                                            {this.state.cEthBorrows} cUZHETH
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
                                        ExchangeRate cETH to ETH: {this.state.cEthExchangeRate}
                                    </div>
                                    <div>
                                        CollateralFactor: {this.state.cEtherCollateralFactor}
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
                                            {this.state.cTokenSupply} cERC20
                                        </div>
                                    </Col>
                                    <Col>
                                        <div>
                                            <h6>Total Borrow</h6>
                                        </div>
                                        <div>
                                            {this.state.cTokenBorrows} cERC20
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
                                        ExchangeRate cErc20 to Erc20: {this.state.cErc20ExchangeRate}
                                    </div>
                                    <div>
                                        CollateralFactor: {this.state.cErc20CollateralFactor}
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