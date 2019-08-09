import React, { Component, useState } from "react";
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
  const [value, setValue] = useState(null);
  const [currentVoter, setCurrentVoter] = useState();
  let handleChange = (e, {value}) => {
    setValue(value);
    setCurrentVoter(voters.filter(voter => voter.address === value)[0]);
  }

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
        onChange={handleChange}
        value={value}
      />
      <div>
        {currentVoter ? "Address : " + currentVoter.address : ""} <br />
        {currentVoter ? "Name : " + currentVoter.name : ""} <br />
        {currentVoter ? "Blinded : " + currentVoter.blinded : ""} <br />
        {currentVoter ? "Signed : " + currentVoter.signed : ""} <br />
        {currentVoter ? "Signer : " + currentVoter.signer : ""}
      </div>
    </div>
  )
}

function VoterInfo(voterInfo) {
  if (voterInfo) {
    return (
      <div>
        Address : {voterInfo.address} <br />
        Name : {voterInfo.name} <br />
        Blinded : {voterInfo.blinded} <br />
        Signed : {voterInfo.signed} <br />
        Signer : {voterInfo.signer}
      </div>
    );
  }
  else {
    return;
  }
}

function OrganizersList(props) {
  const {organizers} = props;
  const organizersList = organizers.map((organizer) => ({
    key: organizer.address,
    value: organizer.address,
    text: organizer.name
  }));
  const [value, setValue] = useState(null);
  const [currentOrganizer, setCurrentOrganizer] = useState();
  let handleChange = (e, {value}) => {
    setValue(value);
    setCurrentOrganizer(organizers.filter(organizer => organizer.address === value)[0]);
  }

  return (
    <div>
      <Header>
        Registered Organizers List
      </Header>
      <Dropdown
        placeholder='Search organizer name'
        fluid
        search
        clearable
        selection
        options={organizersList}
        onChange={handleChange}
        value={value}
      />
      {OrganizerInfo(currentOrganizer)}
    </div>
  )
}

function OrganizerInfo(organizerInfo) {
  if (organizerInfo) {
    return (
      <div>
        Address : {organizerInfo.address} <br />
        Name : {organizerInfo.name} <br />
        N : {organizerInfo.blindSigKey.N} <br />
        E : {organizerInfo.blindSigKey.E}
      </div>
    );
  }
  else {
    return;
  }
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
      dataKeyOrganizers: null,
      dataKeyOrganizerAddresses: null,
      dataKeyOrganizerCount: null,
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

  componentDidUpdate(prevProps, prevState) {
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
          name: voter.value.name,
          blinded: voter.value.blinded,
          signed: voter.value.signed,
          signer: voter.value.signer
        })
      }

      this.setState({ voters: voters });
    }

    if (this.state.dataKeyOrganizerCount === null) {
      const dataKeyOrganizerCount = contract.methods.organizerCount.cacheCall();
      this.setState({
        dataKeyOrganizerCount
      });
    }

    const organizerCount = VotingContract.organizerCount[this.state.dataKeyOrganizerCount];
    let dataKeyOrganizerAddresses = [];
    if (this.state.dataKeyOrganizerAddresses && parseInt(organizerCount.value) !== this.state.dataKeyOrganizerAddresses.length) {
      // There is a change in organizerCount, reset dataKeys
      this.setState({
        dataKeyOrganizers: null,
        dataKeyOrganizerAddresses: null,
        organizers: null
      })
    }
    else if (organizerCount && this.state.dataKeyOrganizerAddresses == null) {
      for (let i = 0; i < organizerCount.value; i++) {
        dataKeyOrganizerAddresses.push(contract.methods.organizerAddresses.cacheCall(i));
      }
      this.setState({ dataKeyOrganizerAddresses: dataKeyOrganizerAddresses });
    }
    else if (this.state.dataKeyOrganizerAddresses && this.state.dataKeyOrganizers == null) {
      for (const dataKeyOrganizerAddress of this.state.dataKeyOrganizerAddresses) {
        const organizerAddress = VotingContract.organizerAddresses[dataKeyOrganizerAddress];
        if (!organizerAddress) {
          return;
        }
      }

      // Only do this if all dataKeyOrganizerAddresses are already loaded
      let dataKeyOrganizers = [];
      for (const dataKeyOrganizerAddress of this.state.dataKeyOrganizerAddresses) {
        const organizerAddress = VotingContract.organizerAddresses[dataKeyOrganizerAddress];
        dataKeyOrganizers.push(contract.methods.organizers.cacheCall(organizerAddress.value));
      }

      this.setState({ dataKeyOrganizers: dataKeyOrganizers });
    }
    else if (this.state.dataKeyOrganizers && this.state.organizers == null) {
      for (let i = 0; i < this.state.dataKeyOrganizers.length; i++) {
        const dataKeyOrganizer = this.state.dataKeyOrganizers[i];
        const organizer = VotingContract.organizers[dataKeyOrganizer];
        if (!organizer) {
          return;
        }
      }

      // Only do this if all dataKeyOrganizers are already loaded
      let organizers = [];
      for (let i = 0; i < this.state.dataKeyOrganizers.length; i++) {
        const dataKeyOrganizer = this.state.dataKeyOrganizers[i];
        const organizer = VotingContract.organizers[dataKeyOrganizer];
        // Create organizer object
        organizers.push({
          id: i,
          address: organizer.args[0],
          name: organizer.value.name,
          blindSigKey: {
            N: organizer.value.N,
            E: organizer.value.E
          }
        });
      }
      this.setState({ organizers: organizers });
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
        <OrganizersList organizers={this.state.organizers ? this.state.organizers : []} />
        <Divider />
        <VotersList voters={this.state.voters ? this.state.voters : []} />
      </div>
    );
  }
}

export default Home;