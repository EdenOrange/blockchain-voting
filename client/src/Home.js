import React, { Component } from "react";
import { Divider, Dropdown, Header, List } from 'semantic-ui-react';

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

function CandidatesList(props) {
  const {candidates} = props;
  const Candidates = candidates.map((candidate) => CandidateInfo(candidate));

  return (
    <div>
      <Header>
        Candidates List
      </Header>
      <List ordered>
        {Candidates}
      </List>
    </div>
  )
}

function CandidateInfo(candidate) {
  return (
    <List.Item key={candidate.id}>
      {candidate.name}
    </List.Item>
  )
}

function VotersList(props) {
  const {voters} = props;
  const votersList = voters.map((voter) => ({
    key: voter.address,
    value: voter.address,
    text: voter.name
  }));

  return (
    <div>
      <Header>
        Registered Voters List
      </Header>
      <Dropdown
        placeholder='Search your name'
        fluid
        search
        clearable
        selection
        options={votersList}
      />
    </div>
  )
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votingContract: {
        status: "Preparation",
        result: "Voting result",
        candidates: [
          {
            id: '1',
            name: 'Candidate1'
          },
          {
            id: '2',
            name: 'Candidate2'
          }
        ],
        voters: [
          {
            address: '0xAddress001',
            name: 'Name1'
          },
          {
            address: '0xAddress002',
            name: 'Name123'
          },
          {
            address: '0xAddress003',
            name: 'NameAs Df'
          }
        ]
      }
    }
  }

  render() {
    return (
      <div>
        <VotingContractInfo votingContract={this.state.votingContract} />
        <Divider />
        <CandidatesList candidates={this.state.votingContract.candidates} />
        <Divider />
        <VotersList voters={this.state.votingContract.voters} />
      </div>
    );
  }
}

export default Home;