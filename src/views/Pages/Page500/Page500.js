import React, { Component } from "react";
import {
  Button,
  Col,
  Card,
  CardBody,
  Table,
  CardHeader,
  Container,
  Row
} from "reactstrap";
import getWeb3 from "../../../Dependencies/utils/getWeb3";
import {subCurrency} from "../../../contract_abi";
import Tables from "../../Base/Tables/Tables";
import Cards from "../../Base/Cards/Cards";

class Page500 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //declaring state variables
      web3: null,
      currentAddress: null,
      events: null
    };
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

    const UserDetailsContract = new this.state.web3.eth.Contract(
      subCurrency.abi, subCurrency.contract_address
    );
    UserDetailsContract.getPastEvents(
      "AllEvents",
      {
        fromBlock: 0,
        toBlock: "latest"
      },
      (err, events) => {
        console.log("---events---");
        console.log("No of events", events.length);
        console.log("custom ", events[1].blockNumber);

        this.setState({ events: events });
        console.log("events in 500", this.state.events);
      }
    );
  }
  createTable = () => {
    let table = [];
    let ids = [];

    // Outer loop to create parent
    // for (let i = 0; i < 3; i++) {

    // children.map(
    //   chk => {
    //     return (<tr>
    //       <td>chk.id</td>
    //       <td>chk.col1</td>
    //       <td>chk.col2</td>
    //       <td>chk.col3</td>
    // <td>
    //   <input type="checkbox"
    //     // defaultChecked={this.state.chkbox}
    //     onChange={console.log("checkbox")} />
    // </td>
    //     </tr>);
    //   },
    for (let i = 0; i < this.state.events.length; i++) {
      table.push(
        <tr key={i}>
          <td>{this.state.events[i].blockNumber}</td>
          {/* <td>{this.state.events[i].returnValues[0]}</td> */}
          <td>
            {this.state.events[i].event} &nbsp; (
            {this.state.events[i].returnValues[0]}&nbsp; ==>&nbsp;
            {this.state.events[i].returnValues[1]})
          </td>
          <td>{this.state.events[i].returnValues[2]}</td>
          {/* <td>{}</td> */}
        </tr>
      );
    }
    return table;
  };
  render() {
    if (this.state.events === null) return <div />;
    else {
      return (
        <div className="animated fadeIn container">
          {/* <Cards events={this.state.events} /> */}
          <Col xs="12" lg="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify" /> Explorer
              </CardHeader>
              <CardBody>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>blockNumber</th>
                      <th>event</th>
                      <th>Amount(in Krupees)</th>
                    </tr>
                  </thead>
                  <tbody>{this.createTable()}</tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </div>
      );
    }
  }
}

export default Page500;
