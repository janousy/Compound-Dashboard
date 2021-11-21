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
            showAlertSuccess: false,
            showAlertFailure: false,
            showFunctionLoading: false,
            transactionMessage: {}
        }
    }

    componentDidMount() {
    }

    handleRepayCurrency = (event) => {
        console.log(event)
        if (event === 'UZHETH') {
            this.setState({currency: event, collateral: 'ERC20'})
        } else {
            this.setState({currency: event, collateral: 'UZHETH'})
        }
    }

    onClickRepay = async () => {
        this.setState({showFunctionLoading: true, showAlertSucces: false, showAlertFailure: false})
        try {
            let transaction = {};
            if (this.state.currency === 'ERC20') {
                transaction = await repayErc20(this.state.repayAmount);
            } else if (this.state.currency === 'UZHETH') {
                transaction = await repayETH(this.state.repayAmount);
            } else {
                console.log("invalid currency");
            }
            console.log(JSON.stringify(transaction))
            this.setState({
                showFunctionLoading: false,
                showAlertSuccess: true,
                showAlertFailure: false,
                transactionMessage: transaction
            })
        } catch (error) {
            console.error(error)
            const message = error.message;
            this.setState({
                showFunctionLoading: false,
                showAlertSuccess: false,
                showAlertFailure: true,
                transactionMessage: message
            })
        }
    }

    render() {
        return (
            <Row className="ms-3 d-block">
                <div className="d-flex flex-column BoxContainer">
                    <div className="SubTitle mt-2">Repay Borrow</div>
                    <FormText>Amount to repay</FormText>
                    <FormControl onChange={event => {
                        this.setState({repayAmount: event.target.value})
                    }}
                                 className="Form mt-2 text-center"
                                 value={this.state.repayAmount}/>
                    <DropdownButton onSelect={this.handleRepayCurrency} className="mt-2"
                                    title={"Currency: " + this.state.currency}>
                        <Dropdown.Item eventKey="UZHETH" value='UZHETH'>UZHETH</Dropdown.Item>
                        <Dropdown.Item eventKey="ERC20" value='ERC20'>ERC20</Dropdown.Item>
                    </DropdownButton>
                    <Button disabled={this.state.repayAmount <= 0}
                            onClick={this.onClickRepay}
                            className="Button mb-3 mt-2"
                            variant="primary">Repay</Button>
                    <Spinner hidden={!this.state.showFunctionLoading} animation="border" role="status"/>
                    <Alert hidden={!this.state.showAlertSuccess} variant='success'>
                        <p>Successfully repaid!</p>
                    </Alert>
                    <Alert hidden={!this.state.showAlertFailure} variant='danger'>
                        <p>Transaction failed!</p>
                        <p>{JSON.stringify(this.state.transactionMessage)}</p>
                    </Alert>
                </div>
            </Row>
        )
    }
}

export default RepayButton;