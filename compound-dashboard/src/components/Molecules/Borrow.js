import React from "react";
import Container from "react-bootstrap/Container";
import '../../Styles/Molecules/Supply.css';
import BorrowButton from "../Atoms/BorrowButton";
import RepayButton from "../Atoms/RepayButton";

class Borrow extends React.Component {
    render() {
        return (
            <Container>
                <div className="Title mb-4">Borrow Functions</div>
                <div className="d-flex justify-content-between">
                    <BorrowButton></BorrowButton>
                    <RepayButton></RepayButton>
                </div>
            </Container>
        )
    }
}

export default Borrow;