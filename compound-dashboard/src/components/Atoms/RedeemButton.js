import React from "react";
import Row from "react-bootstrap/Row";
import {Button, Dropdown, DropdownButton, FormControl, InputGroup} from "react-bootstrap";
import '../../Styles/Molecules/Supply.css';

class RedeemButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { currency: '' }
    }

    componentDidMount() {
    }

    render() {
        return (
            <Row>
                <div className="d-flex flex-column BoxContainer">
                    <div className="SubTitle mt-2">Redeem</div>
                    <FormControl className="Form mt-2 text-center" placeholder="Amount to Redeem"/>
                    <DropdownButton className="mt-2" title="Select Currency">
                        <Dropdown.Item href="#/action-1">UZHETH</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">UZHDAI</Dropdown.Item>
                    </DropdownButton>
                    <Button className="Button mb-3 mt-2" variant="primary">Redeem</Button>
                </div>
            </Row>
        )
    }
}

export default RedeemButton;