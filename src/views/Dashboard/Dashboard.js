import React, { Component, lazy, Suspense } from 'react';
import { Link, BrowserRouter, Route, Redirect } from "react-router-dom";
import getWeb3 from "../../Dependencies/utils/getWeb3";
import { subCurrency } from "../../contract_abi";

import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
} from 'reactstrap';




class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userAddress: '',
      account: null,
      value: '',
      web3: null,
      userInfo: null,
      count:0
    };

  }

  async componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    await getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })

        // Instantiate contract once web3 provided.

      })
      .catch(() => {
        console.log('Error finding web3.')
      })

    await this.instantiateContract()
    
  }

  async instantiateContract() {

    //Sub Currency Contract Instantiation
    const subCurrencyAddress = subCurrency.contract_address
    const ABIsubCurrency = subCurrency.abi
    var subCurrencyContract = new this.state.web3.eth.Contract(ABIsubCurrency, subCurrencyAddress)
    this.subCurrencyContract = subCurrencyContract

    //Get account from metamask
    await this.state.web3.eth.getAccounts((error, accounts) => {
      if (!error) {
        console.log(accounts[0])
      }

      //get aadhaar value stored in Session
      let phone = sessionStorage.getItem('phoneNumber')

      this.subCurrencyContract.methods.getDetails(phone).call(
        {from: accounts[0]},
        (error, data) =>{
          if(error)
            console.log(error)
          else {
            this.setState({
              userInfo: data,
              count:1
            })
          }  
        }
      )
    })
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    if (sessionStorage.getItem("phoneNumber") === null)
      //return (window.location.href = "/dashboard");
      this.props.history.push("/login");

    if (this.state.count == 0) {
      return (
        <div>Loading...</div>
      );
    }
    else {
      return (
        <div className="animated fadeIn">
      <Row>
          <Col md="9" lg="12" xl="12">
        <Card>
       
          <CardHeader>
            <strong>Your Information<b id="policy" > </b></strong>
          </CardHeader>
          <CardBody>
          <Table responsive striped>
          <tbody>
            <tr>
              <td><strong>User Name</strong></td>
              <td>{this.state.userInfo[0]}</td>
            </tr>
            <tr>
              <td><strong>Phone Number</strong></td>
              <td>{sessionStorage.getItem('phoneNumber')}</td>
            </tr>
            <tr>
              <td><strong>Account Balance</strong></td>
              <td>Rs. {this.state.userInfo[1]}</td>
            </tr>
          </tbody>

          </Table>
         
          </CardBody>         
        </Card>
        </Col>
        </Row>
        </div>
      );

    }

  }
}

export default Dashboard;
