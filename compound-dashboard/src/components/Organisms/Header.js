import {Container} from "react-bootstrap";
import React from "react";
import Navbar from "react-bootstrap/cjs/Navbar";
import NavbarCollapse from "react-bootstrap/NavbarCollapse";
import Nav from "react-bootstrap/cjs/Nav";
import '../../Styles/Header.css'

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = { connected: false }
    }

    componentDidMount() {
        // fake function for metamask update
        setTimeout(() => {
            this.setState({connected: true})
        }, 5000);
    }

    render() {
        return (
            <Navbar sticky="top" bg="light" variant="light">
                <Container fluid>
                    <Navbar.Brand href="#home">UZH Compound</Navbar.Brand>
                    <NavbarCollapse id="navbar" className="justify-content-between">
                        <Nav className="">
                            <Nav.Link href="#home">Home</Nav.Link>
                        </Nav>
                        <Navbar.Text>
                            <div className="d-flex flex-row align-items-center">
                                Connected to Metamask
                                <div className="ConnectionIndicator" style={{background: this.state.connected ? "green" : "red"}}/>
                            </div>
                        </Navbar.Text>
                    </NavbarCollapse>
                </Container>
            </Navbar>
        )
    }
}

export default Header;