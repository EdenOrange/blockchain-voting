import React, { Component } from "react";
import { Header } from 'semantic-ui-react';

function VotingContractInfo(props) {
  return (
    <div>
      <VotingContractStatus status={props.votingContract.status} />
      { props.votingContract.status === "Finished" && <VotingResult result={props.votingContract.result} /> }
    </div>
  );
}

function VotingContractStatus(props) {
  return (
    <div>
      <Header as='h1'>
        Voting contract status : {props.status}
      </Header>
    </div>
  )
}

function VotingResult(props) {
  return (
    <div>
      <Header as='h2'>
        Voting result : {props.result}
      </Header>
    </div>
  )
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votingContract: {
        status: "Preparation",
        result: "Voting result"
      }
    }
  }

  render() {
    return (
      <div>
        <VotingContractInfo votingContract={this.state.votingContract} />
      </div>
    );
  }
}

export default Home;