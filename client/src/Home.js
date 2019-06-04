import React, { Component } from "react";
import { Divider, Dropdown, Header, List } from 'semantic-ui-react';

const Status = {
  0: 'Preparation',
  1: 'Registration',
  2: 'Voting',
  3: 'Tallying',
  4: 'Finished'
}

function VotingContractInfo(props) {
  return (
    <div>
      <VotingContractStatus status={props.votingStatus} />
      { props.votingStatus === 4 && <VotingResult result={props.votingContract.result} /> }
    </div>
  );
}

function VotingContractStatus(props) {
  return (
    <div>
      <Header as='h1'>
        Voting contract status : {props.status && Status[props.status.value]}
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
      dataKeyStatus: null,
      dataKeyCandidates: null,
      dataKeyCandidateIds: null,
      dataKeyCandidateCount: null,
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

  componentDidMount() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const dataKeyStatus = contract.methods.state.cacheCall();
    const dataKeyCandidateCount = contract.methods.candidateCount.cacheCall();
    this.setState({
      dataKeyStatus,
      dataKeyCandidateCount
    });
  }

  componentDidUpdate() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const {VotingContract} = this.props.drizzleState.contracts;

    const candidateCount = VotingContract.candidateCount[this.state.dataKeyCandidateCount];
    let dataKeyCandidateIds = [];
    if (candidateCount && this.state.dataKeyCandidateIds == null) {
      for (let i = 0; i < candidateCount.value; i++) {
        dataKeyCandidateIds.push(contract.methods.candidateIds.cacheCall(i));
      }
      this.setState({ dataKeyCandidateIds: dataKeyCandidateIds });
    }
    else if (this.state.dataKeyCandidateIds && this.state.dataKeyCandidates == null) {
      let dataKeyCandidates = [];
      for (const dataKeyCandidateId of this.state.dataKeyCandidateIds) {
        const candidateId = VotingContract.candidateIds[dataKeyCandidateId];
        if (candidateId) {
          dataKeyCandidates.push(contract.methods.candidates.cacheCall(candidateId.value));
        }
      }

      if (dataKeyCandidates.length > 0) {
        console.log(dataKeyCandidates);
        this.setState({ dataKeyCandidates: dataKeyCandidates });
      }
    }
  }

  render() {
    const {VotingContract} = this.props.drizzleState.contracts;
    const status = VotingContract.state[this.state.dataKeyStatus];

    return (
      <div>
        <VotingContractInfo votingContract={this.state.votingContract} votingStatus={status} />
        <Divider />
        <CandidatesList candidates={this.state.votingContract.candidates} />
        <Divider />
        <VotersList voters={this.state.votingContract.voters} />
      </div>
    );
  }
}

export default Home;