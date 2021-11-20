import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import {Button, FormControl, InputGroup} from "react-bootstrap";


class Supply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }

    componentDidMount() {
    }

    render() {
        return (
            <Container>
                <Row className="w-auto">
                    <h2>Supply</h2>
                    <div className="d-flex flex-row justify-content-center">
                        <FormControl className="w-25 me-4" placeholder="Amount to Supply"></FormControl>
                        <Button className="w-25 m-0" variant="primary">Supply</Button>
                    </div>
                </Row>
                <Row>
                    <h2>Redeem</h2>
                    <div className="d-flex flex-row justify-content-center">
                        <FormControl className="w-25 me-4" placeholder="Amount to Redeem"></FormControl>
                        <Button className="w-25 m-0" variant="primary">Redeem</Button>
                    </div>
                </Row>
            </Container>
        )
    }
}

export default Supply;