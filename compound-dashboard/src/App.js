import './App.css';
import Container from "react-bootstrap/cjs/Container";
import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from "./components/Organisms/Header";
import MainContent from "./components/Organisms/MainContent";

class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = { account: '' }
    }

    componentDidMount() {
        // this.initialize();
    }

    initialize = () => {
        //Basic Actions Section
        const onboardButton = document.getElementById('connectToMetamaskButton');

        //Created check function to see if the MetaMask extension is installed
        const isMetaMaskInstalled = () => {
            //Have to check the ethereum binding on the window object to see if it's installed
            const { ethereum } = window;
            return Boolean(ethereum && ethereum.isMetaMask);
        };


        const onClickConnect = async () => {
            try {
                // Will open the MetaMask UI
                // You should disable this button while the request is pending!
                const { ethereum } = window;
                await ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await ethereum.request({ method: 'eth_accounts' });
                this.setState({account: accounts[0]});
                onboardButton.disabled = true;

            } catch (error) {
                console.error(error);
            }
        };


        //------Inserted Code------\\
        const MetaMaskClientCheck = () => {
            //Now we check to see if Metmask is installed
            if (!isMetaMaskInstalled()) {
                //If it isn't installed we ask the user to click to install it
                onboardButton.innerText = 'Click here to install MetaMask!';
            } else {
                //If MetaMask is installed we ask the user to connect to their wallet
                //When the button is clicked we call this function to connect the users MetaMask Wallet
                onboardButton.onclick = onClickConnect;
            }
        };

        MetaMaskClientCheck();
        //------/Inserted Code------\\
    };

    render() {
      return (
            <div className="App">
              <Container fluid className="p-0">
                <Header account={this.state.account}/>
                <MainContent/>
              </Container>
            </div>
            )
    }
}

export default App;
