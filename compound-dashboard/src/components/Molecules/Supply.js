import React from "react";
import Container from "react-bootstrap/Container";
import '../../Styles/Molecules/Supply.css';
import SupplyButton from "../Atoms/SupplyButton";
import RedeemButton from "../Atoms/RedeemButton";

class Supply extends React.Component {
    constructor(props) {
        super(props);
        this.state = { currency: '' }
    }

    componentDidMount() {
    }

    render() {
        return (
            <Container>
                <div className="Title mb-4">Supply Functions</div>
                <div className="d-flex justify-content-between">
                    <SupplyButton></SupplyButton>
                    <RedeemButton></RedeemButton>
                </div>
            </Container>
        )
    }
}

export default Supply;