import React from "react";
import Row from "react-bootstrap/Row";
import {Alert, Button, Dropdown, DropdownButton, FormControl, FormText, Spinner} from "react-bootstrap";
import '../../Styles/Molecules/Supply.css';
import {supplyEth} from "../../scripts/supply-eth";
import {CONSTANTS} from "../../const/const";
import {supplyErc20} from "../../scripts/supply-erc20";

class SupplyButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currency: CONSTANTS.assets[0],
            amount: 0,
            showSupplySuccess: false,
            showSupplyError: false,
            showSupplyLoading: false,
            transaction: {},
        };
    }

    setCurrency = (currency) => {
        this.setState({currency: currency});
    };

    callSupply = async () => {
        this.setState({showSupplyLoading: true});
        let transaction = {};
        try {
            if (this.state.currency === CONSTANTS.assets[0]) {
                transaction = await supplyEth(parseInt(this.state.amount, 10));
            }
            else if (this.state.currency === CONSTANTS.assets[1]) {
                transaction = await supplyErc20(parseInt(this.state.amount, 10));
            }
            this.setState({showSupplyLoading: false, showSupplySuccess: true, transaction: transaction});
            setTimeout(() => {
                this.setState({showSupplySuccess: false, transaction: '', amount: 0});
            }, CONSTANTS.errorTiming);
        } catch (err) {
            console.error(err.message);
            this.setState({showSupplyLoading: false, showSupplyError: true, transaction: err.message});
            setTimeout(() => {
                this.setState({showSupplyError: false, transaction: ''});
            }, CONSTANTS.errorTiming);
        }
    };

    render() {
        return (
            <Row className="ms-3 d-block">
                <div className="d-flex flex-column BoxContainer">
                    <div className="SubTitle mt-2">Supply</div>
                    <FormText>Amount to supply</FormText>
                    <FormControl onChange={e => this.setState({ amount: e.target.value })} className="Form mt-2 text-center" value={this.state.amount}/>
                    <DropdownButton onSelect={this.setCurrency} className="mt-2" title={`Currency: ${this.state.currency}`}>
                        <Dropdown.Item eventKey={CONSTANTS.assets[0]}>UZHETH</Dropdown.Item>
                        <Dropdown.Item eventKey={CONSTANTS.assets[1]}>ERC20</Dropdown.Item>
                    </DropdownButton>
                    <Button
                        disabled={this.state.amount <= 0}
                        onClick={this.callSupply}
                        className="Button mb-3 mt-2"
                        variant="primary">Supply
                    </Button>
                    <Spinner hidden={!this.state.showSupplyLoading} animation="border" role="status"/>
                    <Alert hidden={!this.state.showSupplySuccess} variant='success'>
                        <p>Successfully supplied!</p>
                    </Alert>
                    <Alert hidden={!this.state.showSupplyError} variant='danger'>
                        <p>Transaction failed!</p>
                        <p>{JSON.stringify(this.state.transaction)}</p>
                    </Alert>
                </div>
            </Row>
        )
    }
}

export default SupplyButton;