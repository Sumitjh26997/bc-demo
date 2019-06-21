import React, { Component } from 'react'
import getWeb3 from "../../../Dependencies/utils/getWeb3";
import { subCurrency } from "../../../contract_abi";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Input,
  FormText,
  Label,
  FormGroup,
  Form,
  CardFooter,
  Table
} from "reactstrap";


export class SendMoney extends Component {
  constructor(props) {
    super(props)

    this.state = {
      userAddress: '',
      selectValue: '',
      account: null,
      value: '',
      web3: null,
      phoneNumbers: [],
      phoneNumbersDetails: [],
      userSelected: null,
      myBalance: null,
      amount: null,
      set:0,
    };

    this.userPopulate = this.userPopulate.bind(this);
    this.getUserDetails = this.getUserDetails.bind(this);
    this.sendMoney = this.sendMoney.bind(this);
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
        this.setState({
          account: accounts[0]
        })
        this.subCurrencyContract.methods.getPhones().call({
          from: accounts[0]
        }, (error, x) => {
          console.log(x)
          this.setState({
            phoneNumbers: x
          })

          let phone = []

          for (let i = 0; i < x.length; i++) {
             
              this.subCurrencyContract.methods.getDetails(x[i]).call(
                { from: accounts[0] }, (error, y) => {
                  
                  if(x[i] != sessionStorage.getItem("phoneNumber")) {
                    this.subCurrencyContract.methods.getAddress(x[i]).call(
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
                  else {
                    this.setState({
                      myBalance: y[1]
                    })
                    
                  }

                }
              )
            

          }
        }
        )
      }
      else {
        console.log(error)
      }

    })
  }

  //populate the user list drop down menu
  userPopulate(phoneNumberDetails) {
    
    const rows = phoneNumberDetails.map((row, index) => {
      return (
        <option key={index} value={index}>
          {this.state.phoneNumbersDetails[index].name}
        </option>
      );

    });
    //return the table of records
    return rows
  }

  getUserDetails(index) {
    console.log(this.state.phoneNumbersDetails[index].name)

    var table = document.getElementById("user");

    var header = table.getElementsByTagName('tbody')[0]

    // var header = table.createTBody();
    if(this.state.set == 1)
      header.deleteRow(0);
    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = header.insertRow(0);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2)

    // Add some text to the new cells:
    cell1.innerHTML = this.state.phoneNumbersDetails[index].name;
    cell2.innerHTML = this.state.phoneNumbersDetails[index].phone;
    cell3.innerHTML = this.state.phoneNumbersDetails[index].address;

    document.getElementById("amountForm").style.display = "block"
  }

  sendMoney(event) {
    event.preventDefault()
    this.state.web3.eth.getAccounts((error, accounts)=>{
      this.subCurrencyContract.methods.send(this.state.amount, this.state.phoneNumbersDetails[this.state.userSelected].phone)
      .send(
        {
          from: accounts[0],
          gasPrice: this.state.web3.utils.toHex(this.state.web3.utils.toWei("0", "gwei"))
        },
        (error, txHash) => {
          if (!error) {
            console.log("tx: " + txHash);
            alert("Transaction Hash:" + txHash);
            alert("Amount Transferred Successfully");
            //window.location.reload(true);
          } 
          else 
            alert("Looks like you don't have sufficient funds for this transaction");
        }
      )
    })
  }

  render() {
    //don't render if not loaded
    if ((this.state.phoneNumbers.length-1) != this.state.phoneNumbersDetails.length) {
      return <div>Loading...</div>
    }
    //render if loaded{policy:this.state.policyContract, company:this.state.insurnaceAddress}
    else {
      return (
        <div className="animated fadeIn">

          <Row>
            <Col md="9" lg="12" xl="12">
              <Card>

                <CardHeader>
                  <h3>
                    <strong>User List <b id="policy" style={{display:"inline-block",color:"green",float:"right"}}>My Balance: Rs.{this.state.myBalance} </b></strong>
                  </h3>
                </CardHeader>
                <CardBody>
                  <FormGroup row>

                    <Col xs="12" md="6">
                      <Input type="select" required={true} defaultValue="no-value" onChange={event => {
                        this.setState({ userSelected: event.target.value,
                                        set:1
                                      })
                        this.getUserDetails(event.target.value)
                      }}>
                        <option value="no-value" disabled>Select User</option>
                        {this.userPopulate(this.state.phoneNumbersDetails)}
                      </Input>

                    </Col>
                  </FormGroup>

                  <Table responsive striped id="user">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Phone Number</th>
                        <th>Ethereum Address</th>
   
                      </tr>
                    </thead>
                    <tbody>
                      {/* {this.showPolicies(this.state.userSelected, this.state.selectedUserDetails)} */}
                    </tbody>
                  </Table>
                  <Form
                      onSubmit={this.sendMoney}   
                      className="form-horizontal"
                      id="amountForm"
                      style={{display:"none"}}
                  >
                    <Table responsive striped>
                      <tbody>
                        <tr>
                          <td><Label><b>Enter amount to be sent  : 
                            </b></Label>&nbsp;&nbsp;                          
                            <Input
                              style={{border:'1px solid red',backgroundColor:'#f0f3f5',display:"inline",width:"20%"}}
                              type="text"
                              pattern=".{0,6}"
                              min="0"
                              onChange={event => this.setState({ amount: event.target.value })}          
                              required={true}      
                            /></td>
                          <td>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Button
                              style={{width:"20%"}} 
                              className="btn-facebook mb-1" block
                              block color="primary" 
                              size="md"
                              type="submit"
                              ><b><span>Send</span></b>
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </Table>                         
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>

      );
    }



  }

}


export default SendMoney;
