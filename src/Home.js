import React, { Component } from "react";
import { Header } from 'semantic-ui-react';

function ShowVotingContractInfo(props) {
  return (
    <div>
      <ShowVotingContractStatus status={props.votingContract.status} />
      { props.votingContract.status === "Finished" && <ShowVotingResult result={props.votingContract.result} /> }
    </div>
  );
}

function ShowVotingContractStatus(props) {
  return (
    <div>
      <Header as='h1'>
        Voting contract status : {props.status}
      </Header>
    </div>
  )
}

function ShowVotingResult(props) {
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
        <ShowVotingContractInfo votingContract={this.state.votingContract} />
      </div>
    );
  }
}

export default Home;