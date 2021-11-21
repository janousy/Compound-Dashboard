import React, {useState} from "react";
import Row from "react-bootstrap/Row";
import {Button, Dropdown, DropdownButton, FormControl, FormText, Spinner, Alert} from "react-bootstrap";
import '../../Styles/Molecules/Borrow.css';
import {borrowErc20} from "../../scripts/borrow-erc20-via-solidity";
import {borrowETH} from "../../scripts/borrow-eth-via-solidity";
import {CONSTANTS} from "../../const/const";


class BorrowButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currency: 'UZHETH',
            collateral: 'ERC20',
            borrowAmount: 0,
            collateralAmount: 0,
            showAlertSuccess: false,
            showAlertFailure: false,
            showFunctionLoading: false,
            transactionMessage: {}
        }
    }

    handleBorrowCurrency = (event) => {
        if(event === 'UZHETH') {
            this.setState({currency: event, collateral: 'ERC20'})
        } else {
            this.setState({currency: event, collateral: 'UZHETH'})
        }
    };

    onClickBorrow = async () => {
        this.setState({showFunctionLoading: true, showAlertSuccess: false, showAlertFailure: false});
        try {
            let transaction = {};
            if (this.state.currency === 'ERC20') {
                transaction = await borrowErc20(this.state.borrowAmount, this.state.collateralAmount);
            } else if (this.state.currency === 'UZHETH') {
                transaction = await borrowETH(this.state.borrowAmount, this.state.collateralAmount);
            } else {
                console.log("invalid currency");
            }
            console.log(JSON.stringify(transaction));
            this.setState({
                showFunctionLoading: false,
                showAlertSuccess: true,
                showAlertFailure: false,
                transactionMessage: transaction,
                borrowAmount: 0,
                collateralAmount: 0,
            });
            setTimeout(() => {
                this.setState({showAlertSuccess: false, transaction: ''});
            }, CONSTANTS.errorTiming);
        } catch (error) {
            console.error(error);
            const message = error.message;
            this.setState({
                showFunctionLoading: false,
                showAlertSuccess: false,
                showAlertFailure: true,
                transactionMessage: message
            });
            setTimeout(() => {
                this.setState({showAlertFailure: false, transaction: ''});
            }, CONSTANTS.errorTiming);
        }
    };

    render() {
        return (
            <Row className="ms-3 d-block">
                <div className="d-flex flex-column BoxContainer">
                    <div className="SubTitle mt-2">Borrow</div>
                    <FormText>Amount to borrow</FormText>
                    <FormControl onChange={event => {
                        this.setState({borrowAmount: event.target.value})
                    }}
                                 className="Form mt-2 text-center"
                                 value={this.state.borrowAmount}/>
                    <DropdownButton onSelect={this.handleBorrowCurrency} className="mt-2"
                                    title={"Currency: " + this.state.currency}>
                        <Dropdown.Item eventKey="UZHETH" value='UZHETH'>UZHETH</Dropdown.Item>
                        <Dropdown.Item eventKey="ERC20" value='ERC20'>ERC20</Dropdown.Item>
                    </DropdownButton>
                    <FormText>Amount to supply as collateral</FormText>
                    <FormControl onChange={event => {
                        this.setState({collateralAmount: event.target.value})
                    }}
                                 className="Form mt-2 text-center"
                                 value={this.state.collateralAmount}/>
                    <DropdownButton className="mt-2" disabled title={"Collateral: " + this.state.collateral}>
                        <Dropdown.Item eventKey="UZHETH">UZHETH</Dropdown.Item>
                        <Dropdown.Item eventKey="ERC20">ERC20</Dropdown.Item>
                    </DropdownButton>
                    <Button disabled={this.state.borrowAmount <= 0 || this.state.collateralAmount <= 0}
                            onClick={this.onClickBorrow}
                            className="Button mb-3 mt-2"
                            variant="primary">Borrow
                    </Button>
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

export default BorrowButton;