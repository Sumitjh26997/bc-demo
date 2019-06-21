import React, { Component } from "react";
import { Button, Card, CardBody, CardHeader, Table, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from "reactstrap";

import getWeb3 from "../../../Dependencies/utils/getWeb3";
import {subCurrency} from "../../../contract_abi";
import Tables from "../../Base/Tables/Tables";
import Cards from "../../Base/Cards/Cards";

class ViewTransactions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //declaring state variables
      web3: null,
      currentAddress: null,
      events: null,
      phoneNumbers: [],
      phoneNumbersDetails: [],
      user1: "",
      user2: "",
      set: 0,
    };
    this.userPopulate = this.userPopulate.bind(this);
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
  instantiateContract() {

    const subCurrencyContract = new this.state.web3.eth.Contract(
      subCurrency.abi, subCurrency.contract_address
    );



    subCurrencyContract.getPastEvents(
      "AllEvents",
      {
        fromBlock: 0,
        toBlock: "latest"
      },
      (err, events) => {
        if(events.length == 0) {
          return
        }
        console.log("---events---");
        console.log("No of events", events.length);
        console.log("custom ", events[0].blockNumber);
        console.log("user1:",events[0].returnValues[0])
         this.state.web3.eth.getAccounts(async(error, accounts) => {
          if (!error) {
            console.log(accounts[0])
          }

          subCurrencyContract.methods.getPhones().call({
            from: accounts[0]
          }, (error, x) => {
            console.log(x)
            this.setState({
              phoneNumbers: x
            })
  
            let phone = []
  
            for (let i = 0; i < x.length; i++) {
               
                subCurrencyContract.methods.getDetails(x[i]).call(
                  { from: accounts[0] }, (error, y) => {
                    
                      subCurrencyContract.methods.getAddress(x[i]).call(
                        {from: accounts[0]},(error, z) => {
                          let obj = {}
                          obj['address'] = z
                          obj['phone'] = x[i]
                          obj['name'] = y[0]
          
                          phone.push(obj)
                          
                          this.setState({
                            phoneNumbersDetails: phone
                          })
        
                        }
                      )
                    }
                      
  
                )
              
  
            }
          }
          )
  
          
          for(var i=0;i<events.length;i++) {
            events[i].date = new Date(events[i].returnValues[3]*1000).toLocaleString()

            await subCurrencyContract.methods.getNames(events[i].returnValues[0]).call(
              {from: accounts[0]},
              (error, data) =>{
                if(error)
                  console.log(error)
                else {
                  events[i].user1 = data
                  console.log(data)
                }  
              }
            )
  
            await subCurrencyContract.methods.getNames(events[i].returnValues[1]).call(
              {from: accounts[0]},
              (error, data) =>{
                if(error)
                  console.log(error)
                else {
                  events[i].user2 = data
                  this.setState({ events: events });
  
                }  
              }
            )
  
          }
        })
      }
    );
  }
  createTable = (set, user1) => {
    
    let table = [];
    let ids = [];

    if(set == 0 || user1==="all") {
      for (let i = this.state.events.length - 1 ; i >=0 ; i--) {
        table.push(
          <tr key={i}>
            <td>{this.state.events[i].blockNumber}</td>
            {/* <td>{this.state.events[i].returnValues[0]}</td> */}
            <td>
              
              {this.state.events[i].user1}&nbsp; ==>&nbsp;
              {this.state.events[i].user2}
            </td>
            <td>{this.state.events[i].date}</td>
            <td>{this.state.events[i].returnValues[2]}</td>
            {/* <td>{}</td> */}
          </tr>
        );
      }  
    }
    else if(set == 1 && user1!=="") {
      for (let i = this.state.events.length - 1 ; i >=0 ; i--) {
        if(this.state.events[i].user1 === user1) {
          table.push(
            <tr key={i}>
              <td>{this.state.events[i].blockNumber}</td>
              {/* <td>{this.state.events[i].returnValues[0]}</td> */}
              <td>
                
                {this.state.events[i].user1}&nbsp; ==>&nbsp;
                {this.state.events[i].user2}
              </td>
              <td>{this.state.events[i].date}</td>
              <td>{this.state.events[i].returnValues[2]}</td>
              {/* <td>{}</td> */}
            </tr>
          );
  
        }
      }        
    }
    return table;
  };

  userPopulate(phoneNumberDetails) {
    
    const rows = phoneNumberDetails.map((row, index) => {
      return (
        <option key={index} value={phoneNumberDetails[index].name}>
          {phoneNumberDetails[index].name}
        </option>
      );

    });
    //return the table of records
    return rows
  }



  render() {
    if (((this.state.phoneNumbers.length) != this.state.phoneNumbersDetails.length) || this.state.events===null){
      return <div>Loading...</div>
    } 
    else {
      return (
        <div className="animated fadeIn container">
          {/* <Cards events={this.state.events} /> */}
          <Col xs="12" lg="12">
            <Card>
              <CardHeader>
                <h2>Transaction History</h2> 
              </CardHeader>
              <CardBody>
              <Form id="filter">
                     <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          Filter Transactions
                        </InputGroupText>
                      </InputGroupAddon>
                      <Col md="3" lg="4">
                      <Input type="select" required={true}  onChange={event => {
                        this.setState({ user1: event.target.value,
                                        set:1
                                      })
                      }}
                      >
                        <option value="all">All Transactions</option>
                        {this.userPopulate(this.state.phoneNumbersDetails)}
                      </Input>


                      </Col>
                      {/* <Col md="3" lg="4">
                    <Button color="success" onClick={
                      event=>{
                        this.setState({set:1})
                      }
                    } block>
                      Filter
                    </Button>

                    </Col> */}
                    </InputGroup>
                  </Form>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>blockNumber</th>
                      <th>Transaction Between</th>
                      <th>Date/Time</th>
                      <th>Amount(in Krupees)</th>
                    </tr>
                  </thead>
                  <tbody>{this.createTable(this.state.set, this.state.user1)}</tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </div>
      );
    }
  }
}

export default ViewTransactions;
