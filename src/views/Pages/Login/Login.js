import React, { Component } from "react";
import { Link, BrowserRouter, Route, Redirect } from "react-router-dom";
import { firebaseApp } from "../../../Dependencies/firebase";
import * as firebase from "firebase";
import {subCurrency} from "../../../contract_abi";
import getWeb3 from "../../../Dependencies/utils/getWeb3";
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row
} from "reactstrap";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //declaring state variables
      aadhaar: "",
      web3: null,
      phone: null,
      seedphrase: "",
      phoneNumber: null, 
    };
    this.SignIn = this.SignIn.bind(this);
    this.verifyLogin = this.verifyLogin.bind(this);
    this.validateOTP = this.validateOTP.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });

        // Instantiate contract once web3 provided.
        this.instantiateContract();
      })
      .catch(() => {
        console.log("Error finding web3.");
      });
  }

  componentDidMount() {
    document.getElementById("OTP").style.display = "none";
  }

  instantiateContract() {
    //Sub Currency Contract Instantiation
    const subCurrencyAddress = subCurrency.contract_address
    const ABIsubCurrency = subCurrency.abi
    var subCurrencyContract = new this.state.web3.eth.Contract(ABIsubCurrency, subCurrencyAddress)
    this.subCurrencyContract = subCurrencyContract

    console.log(this.subCurrencyContract)
    
  }

  SignIn(event) {
    event.preventDefault(); //function handling the signup event
    document.getElementById("OTP").style.display = "block";
    //alert("In SignIn");

          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
            "recaptcha-container",{
              //'size' : 'invisible'
            }
          );

        //send OTP to the phone number
          firebaseApp
            .auth()
            .signInWithPhoneNumber(
              "+91" + this.state.phoneNumber,
              window.recaptchaVerifier
            )
            .then(function(confirmationResult) {
              //wait for OTP verification
              window.confirmationResult = confirmationResult;
            });

  }

  //link aadhaar to account address using Smart Contract
  verifyLogin() {
    this.state.web3.eth.getAccounts((error, accounts) => {
      //get the account from metamask
      console.log("Account:",accounts[0])
      this.subCurrencyContract.methods.getAddress(this.state.phoneNumber).call(
        { from: accounts[0] },
        function(error, x) {
          //check if account exists
          if (error) {
            alert("Something went wrong");
            return;
          }
          if (x === accounts[0]) {
            //alert("Login Successfull");
            sessionStorage.setItem('phoneNumber', this.state.phoneNumber)
            this.props.history.push("/dashboard");
            //get address from aadhaar number
          } else {
            alert("Details Incorrect");
          }
        }.bind(this)
      );
    });
  }

  //confirm OTP function and call to linkAadhaar function
  validateOTP = function(event) {
    event.preventDefault();
    let verifyLogin = this.verifyLogin;
     verifyLogin()
    // window.confirmationResult
    //   .confirm(document.getElementById("verificationcode").value)
    //   .then(
    //     function(result) {
    //       verifyLogin();
    //       //window.location.href = '/signin'
    // //       alert("success");
    //     },

    //     function(error) {
    //       alert(error);
    //     }
    //   );
  };

  render() {
    //checking if already logged in and redirecting to /dashboard (2 ways)
    if (sessionStorage.getItem("phoneNumber") !== null)
      //return (window.location.href = "/dashboard");
      this.props.history.push("/dashboard");
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form onSubmit={this.SignIn}>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        type="text"
                        placeholder="Phone Number"
                        pattern=".{10,10}"
                        min="0000000001"
                        onChange={event =>
                          this.setState({ phoneNumber: event.target.value })
                        }
                        required={true}
                      />
                      </InputGroup>
                      <Row>
                        <Col xs="12" sm="12">
                          <Button
                            color="primary"
                            type="submit"
                            className="px-4"
                            block
                          >
                            Get OTP
                          </Button>
                        </Col>
                        {/* <Col xs="6" className="text-right">
                          <Button color="link" className="px-0">Forgot password?</Button>
                        </Col> */}
                      </Row>
                    </Form>
                    <br />
                    <div id="recaptcha-container" />
                    <br />

                    <Form id="OTP" onSubmit={this.validateOTP}>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="text"
                          pattern=".{6,6}"
                          min="000000"
                          id="verificationcode"
                          placeholder="Enter OTP"
                          required={true}
                        />
                      </InputGroup>

                      <Button color="primary" type="submit" block>
                        Submit
                      </Button>
                    </Form>
                  </CardBody>
                </Card>
                <Card
                  className="text-white bg-primary py-5 d-md-down-none"
                  style={{ width: "44%" }}
                >
                  <CardBody className="text-center">
                    <div>
                      <h2>Sign up</h2>
                      <p>
                        Before you register, please create an Ethereum account
                        using Metamask Google Chrome Extension and set the
                        network to http://localhost:7545.
                      </p>
                      <Link to="/register">
                        <Button
                          color="primary"
                          className="mt-3"
                          active
                          tabIndex={-1}
                        >
                          Register Now!
                        </Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;
