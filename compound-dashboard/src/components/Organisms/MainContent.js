import {Container} from "react-bootstrap";
import '../../Styles/Organisms/MainContent.css'
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React from "react";
import Supply from "../Molecules/Supply";
import Borrow from "../Molecules/Borrow";

class MainContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { }
    }

    componentDidMount() {

    }

    render() {
        return (
            <Container className="" fluid>
                <Row className="Spacer pt-4">
                </Row>
                <Row>
                    <Col>
                        <div>
                            <Supply></Supply>
                        </div>
                        <div className="mt-5">
                            <Borrow></Borrow>
                        </div>

                    </Col>
                    <Col>

                    </Col>
                </Row>
            </Container>
        )
    }
}

export default MainContent;