import React from "react";
import {Tabs, Tab, Row, Col, Button} from "react-bootstrap";
import '../../Styles/Molecules/Stats.css';
import {cErcAbi, cEthAbi, erc20Abi} from "../../scripts/contracts/contracts.json";
import {ImSpinner11} from "react-icons/im";
import {getBorrowMarketStats, getExchangeRates, getSupplyMarketStats} from "../../scripts/utils";

class Market extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            borrowEth: 0,
            borrowCeth: 0,
            borrowErc20: 0,
            borrowCerc20: 0,
            supplyEth: 0,
            supplyCeth: 0,
            supplyErc20: 0,
            supplyCerc20: 0,
            exchangeRateEth: 0,
            exchangeRateErc20: 0
        };
    }

    componentDidMount() {
    }

    async handleRefreshMarkets() {
        const {
            cEthAbi,
            cErcAbi,
            erc20Abi,
        } = require("../../scripts/contracts/contracts.json");

        let resultBorrow = await getBorrowMarketStats(cEthAbi, cErcAbi, erc20Abi);
        let resultSupply = await getSupplyMarketStats(cEthAbi, cErcAbi, erc20Abi);
        let exchangeRates = await getExchangeRates(cEthAbi, cErcAbi, erc20Abi);

        this.setState((state) => ({
            borrowEth: resultBorrow.myContractEthBalance,
            borrowCeth: resultBorrow.myContractCEthBalance,
            borrowErc20: resultBorrow.myContractUnderlyingBalance,
            borrowCerc20: resultBorrow.myContractCTokenBalance,
            supplyEth: resultSupply.myContractEthBalance,
            supplyCeth: resultSupply.myContractCEthBalance,
            supplyErc20: resultSupply.myContractUnderlyingBalance,
            supplyCerc20: resultSupply.myContractCTokenBalance,
            exchangeRateEth: exchangeRates.cEthExchangeRate,
            exchangeRateErc20: exchangeRates.erc20ExchangeRate
        }));
    }

    render() {
        return (
            <div className="StatsComponent">
                <Row className="position-relative">
                    <div className="Title mb-4 p-0">Markets</div>
                    <Button className="ButtonStats" variant="primary" onClick={this.handleRefreshMarkets.bind(this)}>
                        <ImSpinner11/>
                    </Button>
                </Row>
                <Row>
                    <div className="BoxContainerUser">
                        <Tabs defaultActiveKey="uzheth" id="uncontrolled-tab-example" className="mb-3">
                            <Tab eventKey="uzheth" title="UZHETH">
                                <Row className="pb-3">
                                    <Col className="ps-4">
                                        <div>
                                            Total Supply
                                        </div>
                                        <div>
                                            {this.state.supplyEth} UZHETH
                                        </div>
                                        <div>
                                            {this.state.supplyCeth} cUZHETH
                                        </div>
                                        <div>
                                            ExchangeRate cETH to ETH: {this.state.exchangeRateEth}
                                        </div>
                                    </Col>
                                    <Col>
                                        <div>
                                            Total Borrow
                                        </div>
                                        <div>
                                            {this.state.borrowEth} UZHETH
                                        </div>
                                        <div>
                                            {this.state.borrowCeth} cUZHETH
                                        </div>
                                    </Col>
                                </Row>
                            </Tab>
                            <Tab eventKey="erc20" title="ERC20">
                                <Row className="pb-3">
                                    <Col className="ps-4">
                                        <div>
                                            Total Supply
                                        </div>
                                        <div>
                                            {this.state.supplyErc20} ERC20
                                        </div>
                                        <div>
                                            {this.state.supplyCerc20} CERC20
                                        </div>
                                        <div>
                                            ExchangeRate Mantissa: {this.state.exchangeRateErc20}
                                        </div>
                                    </Col>
                                    <Col>
                                        <div>
                                            Total Borrow
                                        </div>
                                        <div>
                                            {this.state.borrowErc20} ERC20
                                        </div>
                                        <div>
                                            {this.state.borrowCerc20} cERC20
                                        </div>
                                    </Col>
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