import React from "react";
import Row from "react-bootstrap/Row";
import {Button, Dropdown, DropdownButton, FormControl, InputGroup} from "react-bootstrap";
import '../../Styles/Molecules/Borrow.css';

class RepayButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { currency: '' }
    }

    componentDidMount() {
    }

    render() {
        return (
        <Row className="ms-3 d-block">
            <div className="d-flex flex-column BoxContainer">
                <div className="SubTitle mt-2">Repay</div>
                <FormControl className="Form mt-2 text-center" placeholder="Amount to Repay"/>
                <DropdownButton className="mt-2"  title="Select Currency">
                    <Dropdown.Item href="#/action-1">UZHETH</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">UZHDAI</Dropdown.Item>
                </DropdownButton>
                <Button className="Button mb-3 mt-2" variant="primary">Repay</Button>
            </div>
        </Row>
        )
    }
}

export default RepayButton;