import React from "react";
import Row from "react-bootstrap/Row";
import {Alert, Button, Dropdown, DropdownButton, FormControl, FormText, Spinner} from "react-bootstrap";
import '../../Styles/Molecules/Supply.css';
import {CONSTANTS} from "../../const/const";
import {redeemEth} from "../../scripts/redeem-eth";
import {redeemErc20} from "../../scripts/redeem-erc20";

class RedeemButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currency: CONSTANTS.cAssets[0],
            amount: 0,
            showRedeemSuccess: false,
            showRedeemError: false,
            showRedeemLoading: false,
            transaction: {},
        };
    }

    setCurrency = (currency) => {
        this.setState({currency: currency});
    };

    callRedeem = async () => {
        this.setState({showRedeemLoading: true});
        let transaction = {};
        try {
            if (this.state.currency === CONSTANTS.cAssets[0]) {
                transaction = await redeemEth(parseInt(this.state.amount, 10));
            }
            else if (this.state.currency === CONSTANTS.cAssets[1]) {
                transaction = await redeemErc20(parseInt(this.state.amount, 10));
            }
            this.setState({showRedeemLoading: false, showRedeemSuccess: true, transaction: transaction, amount: 0,});
            setTimeout(() => {
                this.setState({showRedeemSuccess: false, transaction: ''});
            }, CONSTANTS.errorTiming);
        } catch (err) {
            console.error(err.message);
            this.setState({showRedeemLoading: false, showRedeemError: true, transaction: err.message});
            setTimeout(() => {
                this.setState({showRedeemError: false, transaction: ''});
            }, CONSTANTS.errorTiming);
        }
    };

    render() {
        return (
            <Row className="ms-3 d-block">
                <div className="d-flex flex-column BoxContainer">
                    <div className="SubTitle mt-2">Redeem</div>
                    <FormText>Amount to redeem</FormText>
                    <FormControl
                        onChange={e => this.setState({ amount: e.target.value })}
                        className="Form mt-2 text-center"
                        value={this.state.amount}/>
                    <DropdownButton onSelect={this.setCurrency} className="mt-2" title={`Currency: ${this.state.currency}`}>
                        <Dropdown.Item eventKey="cUZHETH">cUZHETH</Dropdown.Item>
                        <Dropdown.Item eventKey="cERC20">cERC20</Dropdown.Item>
                    </DropdownButton>
                    <Button
                        disabled={this.state.amount <= 0}
                        onClick={this.callRedeem}
                        className="Button mb-3 mt-2"
                        variant="primary">Redeem</Button>
                    <Spinner hidden={!this.state.showRedeemLoading} animation="border" role="status"/>
                    <Alert hidden={!this.state.showRedeemSuccess} variant='success'>
                        <p>Successfully redeemed!</p>
                    </Alert>
                    <Alert hidden={!this.state.showRedeemError} variant='danger'>
                        <p>Transaction failed!</p>
                        <p>{JSON.stringify(this.state.transaction)}</p>
                    </Alert>
                </div>
            </Row>
        )
    }
}

export default RedeemButton;