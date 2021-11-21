import React from "react";
import Row from "react-bootstrap/Row";
import {Alert, Button, Dropdown, DropdownButton, FormControl, FormText, InputGroup, Spinner} from "react-bootstrap";
import '../../Styles/Molecules/Borrow.css';
import {repayErc20} from "../../scripts/repay-erc20-via-solidity";
import {repayETH} from "../../scripts/repay-eth-via-solidity";

class RepayButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currency: 'UZHETH',
            repayAmount: 0,
            showBorrowSuccess: false,
            showBorrowLoading: false,
            result: {}
        }
    }

    componentDidMount() {}

    handleRepayCurrency = (event) => {
        console.log(event)
        if(event === 'UZHETH') {
            this.setState({currency: event, collateral: 'ERC20'})
        } else {
            this.setState({currency: event, collateral: 'UZHETH'})
        }
    }

    onClickRepay = () => {
        this.setState({showBorrowLoading: true, showBorrowSuccess: false})

        let transaction = {};
        if(this.state.currency === 'ERC20') {
            repayErc20(this.state.borrowAmount, this.state.collateralAmount)
                .then(result => window.alert(JSON.stringify(result)));
        }
        else if(this.state.currency === 'UZHETH') {
            repayETH(this.state.borrowAmount, this.state.collateralAmount)
                .then(result => window.alert(JSON.stringify(result)));
        }
        else {console.log("invalid currency")}
        this.setState({showBorrowLoading: false, showBorrowSuccess: true, result: transaction})
    }

    render() {
        return (
        <Row className="ms-3 d-block">
            <div className="d-flex flex-column BoxContainer">
                <div className="SubTitle mt-2">Repay Borrow</div>
                <FormText>Amount to repay</FormText>
                <FormControl onChange={event => {this.setState({repayAmount: event.target.value})}}
                             className="Form mt-2 text-center"
                             value={this.state.repayAmount}/>
                <DropdownButton onSelect={this.handleRepayCurrency} className="mt-2" title={"Currency: " + this.state.currency}>
                    <Dropdown.Item eventKey="UZHETH" value='UZHETH' >UZHETH</Dropdown.Item>
                    <Dropdown.Item eventKey="ERC20" value='ERC20'>ERC20</Dropdown.Item>
                </DropdownButton>
                <Button disabled={this.state.repayAmount <= 0}
                        onClick={this.onClickRepay}
                        className="Button mb-3 mt-2"
                        variant="primary">Repay</Button>
                <Spinner hidden={!this.state.showBorrowLoading} animation="border" role="status"/>
                <Alert hidden={!this.state.showBorrowSuccess} variant='success'>
                    <p>Successfully repaid!</p>
                </Alert>
            </div>
        </Row>
        )
    }
}

export default RepayButton;