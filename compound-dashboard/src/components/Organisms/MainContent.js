import {Container} from "react-bootstrap";
import '../../Styles/Organisms/MainContent.css'
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React from "react";
import Supply from "../Molecules/Supply";

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
                    <h3>Tabs oder sowas</h3>
                </Row>
                <Row>
                    <Col>
                        <Supply></Supply>

                    </Col>
                    <Col>

                    </Col>
                </Row>
            </Container>
        )
    }
}

export default MainContent;