import './App.css';
import Row from 'react-bootstrap/Row'
import Container from "react-bootstrap/cjs/Container";
import React from "react";
import Col from "react-bootstrap/cjs/Col";
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from "./components/Organisms/Header";
import MainContent from "./components/Organisms/MainContent";

function App() {
  return (
        <div className="App">
          <Container fluid className="p-0">
            <Header/>
            <MainContent/>
          </Container>
        </div>
  );
}

export default App;
