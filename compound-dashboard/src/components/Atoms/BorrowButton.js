import React, {useState} from "react";
import Row from "react-bootstrap/Row";
import {Button, Dropdown, DropdownButton, FormControl} from "react-bootstrap";
import '../../Styles/Molecules/Borrow.css';
import {borrowErc20} from "../../scripts/borrow-erc20-via-solidity";


class BorrowButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { currency: '', collateral: '', borrowAmount: 0 }
    }
    componentDidMount() {
    }

    handleBorrowCurrency = (event) => {
        console.log(event)
        if(event === 'UZHETH') {
            this.setState({currency: event, collateral: 'ERC20'})
        } else {
            this.setState({currency: event, collateral: 'UZHETH'})
        }
    }

    onClickBorrow = () => {
        console.log(this.state.borrowAmount)
    }

    render() {
        return (
        <Row className="ms-3">
            <div className="d-flex flex-column BoxContainer">
                <div className="SubTitle mt-2">Borrow</div>
                <FormControl onChange={event => {this.setState({borrowAmount: event.target.value})}}
                             className="Form mt-2 text-center"
                             placeholder="Amount to Borrow"
                             value={this.state.borrowAmount}/>
                <DropdownButton onSelect={this.handleBorrowCurrency} className="mt-2" title={"Currency: " + this.state.currency}>
                    <Dropdown.Item eventKey="UZHETH" value='UZHETH' href="#/action-1">UZHETH</Dropdown.Item>
                    <Dropdown.Item eventKey="ERC20" value='ERC20' href="#/action-2">ERC20</Dropdown.Item>
                </DropdownButton>
                <DropdownButton className="mt-2" disabled title={"Collateral: " + this.state.collateral}>
                    <Dropdown.Item eventKey="UZHETH">UZHETH</Dropdown.Item>
                    <Dropdown.Item eventKey="ERC20">ERC20</Dropdown.Item>
                </DropdownButton>
                <Button onClick={this.onClickBorrow} className="Button mb-3 mt-2" variant="primary">Borrow</Button>
            </div>
        </Row>
        )
    }
}

export default BorrowButton;