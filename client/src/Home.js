import React, { Component } from "react";
import { Divider, Dropdown, Header, List } from 'semantic-ui-react';
import TallyResult from './TallyResult';

const Status = {
  '0': 'Preparation',
  '1': 'Registration',
  '2': 'Voting',
  '3': 'Tallying',
  '4': 'Finished'
}

function VotingContractInfo(props) {
  const {status} = props;
  return (
    <div>
      <VotingContractStatus status={status} />
    </div>
  );
}

function VotingContractStatus(props) {
  return (
    <div>
      <Header as='h1'>
        Voting contract status : {props.status && Status[props.status]}
      </Header>
    </div>
  )
}

function CandidatesList(props) {
  const {candidates, status} = props;

  if (status && status === '4') {
    return (
      <TallyResult
        candidates={candidates}
        status={status}
      /> 
    );
  }

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
      dataKeyVoters: null,
      dataKeyVoterAddresses: null,
      dataKeyVoterCount: null,
      candidates: null,
      voters: null
    }
  }

  componentDidMount() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const dataKeyStatus = contract.methods.state.cacheCall();
    const dataKeyCandidateCount = contract.methods.candidateCount.cacheCall();
    const dataKeyVoterCount = contract.methods.voterCount.cacheCall();
    this.setState({
      dataKeyStatus,
      dataKeyCandidateCount,
      dataKeyVoterCount
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
    else if (this.state.dataKeyCandidateIds != null && this.state.dataKeyCandidates == null) {
      for (const dataKeyCandidateId of this.state.dataKeyCandidateIds) {
        const candidateId = VotingContract.candidateIds[dataKeyCandidateId];
        if (!candidateId) {
          return;
        }
      }

      // Only do this if all dataKeyCandidateIds are already loaded
      let dataKeyCandidates = [];
      for (const dataKeyCandidateId of this.state.dataKeyCandidateIds) {
        const candidateId = VotingContract.candidateIds[dataKeyCandidateId];
        dataKeyCandidates.push(contract.methods.candidates.cacheCall(candidateId.value));
      }

      this.setState({ dataKeyCandidates: dataKeyCandidates });
    }
    else if (this.state.dataKeyCandidates && this.state.candidates == null) {
      for (const dataKeyCandidate of this.state.dataKeyCandidates) {
        const candidate = VotingContract.candidates[dataKeyCandidate];
        if (!candidate) {
          return;
        }
      }

      // Only do this if all dataKeyCandidates are already loaded
      let candidates = [];
      for (const dataKeyCandidate of this.state.dataKeyCandidates) {
        const candidate = VotingContract.candidates[dataKeyCandidate];
        candidates.push(candidate);
      }

      this.setState({ candidates: candidates });
    }

    const voterCount = VotingContract.voterCount[this.state.dataKeyVoterCount];
    let dataKeyVoterAddresses = [];
    if (this.state.dataKeyVoterAddresses && parseInt(voterCount.value) !== this.state.dataKeyVoterAddresses.length) {
      // There is a change in voterCount, reset dataKeys
      this.setState({
        dataKeyVoters: null,
        dataKeyVoterAddresses: null,
        voters: null
      })
    }
    else if (voterCount && this.state.dataKeyVoterAddresses == null) {
      for (let i = 0; i < voterCount.value; i++) {
        dataKeyVoterAddresses.push(contract.methods.voterAddresses.cacheCall(i));
      }
      this.setState({ dataKeyVoterAddresses: dataKeyVoterAddresses });
    }
    else if (this.state.dataKeyVoterAddresses && this.state.dataKeyVoters == null) {
      for (const dataKeyVoterAddress of this.state.dataKeyVoterAddresses) {
        const voterAddress = VotingContract.voterAddresses[dataKeyVoterAddress];
        if (!voterAddress) {
          return;
        }
      }

      // Only do this if all dataKeyVoterAddresses are already loaded
      let dataKeyVoters = [];
      for (const dataKeyVoterAddress of this.state.dataKeyVoterAddresses) {
        const voterAddress = VotingContract.voterAddresses[dataKeyVoterAddress];
        dataKeyVoters.push(contract.methods.voters.cacheCall(voterAddress.value));
      }

      this.setState({ dataKeyVoters: dataKeyVoters });
    }
    else if (this.state.dataKeyVoters && this.state.voters == null) {
      for (let i = 0; i < this.state.dataKeyVoters.length; i++) {
        const dataKeyVoter = this.state.dataKeyVoters[i];
        const voter = VotingContract.voters[dataKeyVoter];
        if (!voter) {
          return;
        }
      }

      // Only do this if all dataKeyVoters are already loaded
      let voters = [];
      for (let i = 0; i < this.state.dataKeyVoters.length; i++) {
        const dataKeyVoter = this.state.dataKeyVoters[i];
        const voter = VotingContract.voters[dataKeyVoter];

        // Create voter object
        voters.push({
          address: voter.args[0],
          name: voter.value.name
        })
      }

      this.setState({ voters: voters });
    }
  }

  render() {
    const {VotingContract} = this.props.drizzleState.contracts;
    const status = VotingContract.state[this.state.dataKeyStatus];

    return (
      <div>
        <VotingContractInfo
          status={status ? status.value : null}
        />
        <Divider />
        <CandidatesList
          status={status ? status.value : null}
          candidates={this.state.candidates ? this.state.candidates : []}
        />
        <Divider />
        <VotersList voters={this.state.voters ? this.state.voters : []} />
      </div>
    );
  }
}

export default Home;