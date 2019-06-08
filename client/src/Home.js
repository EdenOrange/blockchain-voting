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
  // console.log(candidates);

  const Candidates = candidates.map((candidate, index) => CandidateInfo(candidate, index));

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

function CandidateInfo(candidate, index) {
  return (
    <List.Item key={index}>
      {candidate.value.name}
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
      candidates: null,
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
    if (this.state.dataKeyCandidateIds && parseInt(candidateCount.value) !== this.state.dataKeyCandidateIds.length) {
      // There is a change in candidateCount, reset dataKeys
      this.setState({
        dataKeyCandidates: null,
        dataKeyCandidateIds: null,
        candidates: null
      })
    }
    else if (candidateCount && this.state.dataKeyCandidateIds == null) {
      for (let i = 0; i < candidateCount.value; i++) {
        dataKeyCandidateIds.push(contract.methods.candidateIds.cacheCall(i));
      }
      this.setState({ dataKeyCandidateIds: dataKeyCandidateIds });
    }
    else if (this.state.dataKeyCandidateIds && this.state.dataKeyCandidates == null && VotingContract.candidateIds[this.state.dataKeyCandidateIds[this.state.dataKeyCandidateIds.length-1]]) {
      // Only do this if all dataKeyCandidateIds are already loaded
      let dataKeyCandidates = [];
      for (const dataKeyCandidateId of this.state.dataKeyCandidateIds) {
        const candidateId = VotingContract.candidateIds[dataKeyCandidateId];
        dataKeyCandidates.push(contract.methods.candidates.cacheCall(candidateId.value));
      }

      this.setState({ dataKeyCandidates: dataKeyCandidates });
    }
    else if (this.state.dataKeyCandidates && this.state.candidates == null && VotingContract.candidates[this.state.dataKeyCandidates[this.state.dataKeyCandidates.length-1]]) {
      // Only do this if all dataKeyCandidates are already loaded
      let candidates = [];
      for (const dataKeyCandidate of this.state.dataKeyCandidates) {
        const candidate = VotingContract.candidates[dataKeyCandidate];
        candidates.push(candidate);
      }

      this.setState({ candidates: candidates });
    }
  }

  render() {
    const {VotingContract} = this.props.drizzleState.contracts;
    const status = VotingContract.state[this.state.dataKeyStatus];

    return (
      <div>
        <VotingContractInfo votingContract={this.state.votingContract} votingStatus={status} />
        <Divider />
        <CandidatesList candidates={this.state.candidates ? this.state.candidates : []} />
        <Divider />
        <VotersList voters={this.state.votingContract.voters} />
      </div>
    );
  }
}

export default Home;