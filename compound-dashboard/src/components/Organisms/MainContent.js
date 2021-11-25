import {Container} from "react-bootstrap";
import '../../Styles/Organisms/MainContent.css'
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React from "react";
import Supply from "../Molecules/Supply";
import Borrow from "../Molecules/Borrow";
import Market from "../Molecules/Market";
import UserStats from "../Molecules/UserStats";

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
                <Row className="Spacer">
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
                        <div>
                            <Market></Market>
                        </div>
                        <div className="mt-5">
                            <UserStats></UserStats>
                        </div>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default MainContent;