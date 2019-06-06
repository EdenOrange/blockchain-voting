import React, { Component } from "react";

class TxStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    const {transactions, transactionStack} = this.props.drizzleState;
    const txHash = transactionStack[this.props.stackId];
    if (!txHash || !transactions[txHash]) {
      return (
        <div></div>
      );
    }
    console.log(transactions[txHash]);
    return (
      <div>
        Transaction Status: {transactions[txHash].status}
      </div>
    );
  }
}

export default TxStatus;