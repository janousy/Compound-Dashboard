import React from "react";
import { Tabs, Tab, Row, Col, Container, Card, Button, ListGroup } from "react-bootstrap";
import '../../Styles/Molecules/Stats.css';
import { cErcAbi, cEthAbi, erc20Abi } from "../../scripts/contracts/contracts.json";
import { ImSpinner11 } from "react-icons/im";
import { getUserStats } from "../../scripts/utils";

class UserStats extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ethBalance: 0,
            cEthBalance: 0,
            erc20Balance: 0,
            cErc20Balance: 0,
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

        let userStats = await getUserStats(cEthAbi, cErcAbi, erc20Abi)

        console.log(userStats);
        console.log(userStats.ethBalance);

        this.setState((state) => ({
            ethBalance: userStats.ethBalance,
            cEthBalance: userStats.cEthBalance,
            erc20Balance: userStats.erc20Balance,
            cErcBalance: userStats.cErc20Balance,
        }));
    }

    render() {
        return (
            <div className="StatsComponent">
                <Row className="position-relative">
                    <div className="Title mb-4 p-0">Your Assets</div>
                    <Button className="ButtonStats" variant="primary" onClick={this.handleRefreshMarkets.bind(this)}>
                        <ImSpinner11 />
                    </Button>
                </Row>
                <Row>
                    <div className="BoxContainerUser">
                        <ListGroup variant='flush'>
                            <ListGroup.Item>
                                <div className="d-flex flex-row justify-content-between">
                                    <p>UZHETH</p>
                                    <p>{this.state.ethBalance}</p>
                                </div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="d-flex flex-row justify-content-between">
                                    <p>cUZHETH</p>
                                    <p>{this.state.cEthBalance}</p>
                                </div>
                            </ListGroup.Item>                            <ListGroup.Item>
                                <div className="d-flex flex-row justify-content-between">
                                    <p>ERC20</p>
                                    <p>{this.state.erc20Balance}</p>
                                </div>
                            </ListGroup.Item>                            <ListGroup.Item>
                                <div className="d-flex flex-row justify-content-between">
                                    <p>cErc20</p>
                                    <p>{this.state.cErc20Balance}</p>
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