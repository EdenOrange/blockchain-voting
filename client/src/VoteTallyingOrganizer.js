import React, { Component, useState } from "react";
import { Button, Divider, Header, Input } from 'semantic-ui-react';
import TxStatus from './TxStatus';
import TallyResult from './TallyResult';
import { BigInteger } from 'jsbn';

// const Status = {
//   0: 'Preparation',
//   1: 'Registration',
//   2: 'Voting',
//   3: 'Tallying',
//   4: 'Finished'
// }

function EndVotingInfo(props) {
  const {endVotingTime, status, countedVotes, validVotes, voteCount} = props;

  if (status === '2') {
    return (
      <div>
        <Header>
          Voting is in progress
        </Header>
        <Header>
          Voting may be ended at : {endVotingTime && new Date(endVotingTime*1000).toString()}
        </Header>
      </div>
    );
  }
  else if (status === '3') {
    return (
      <div>
        <Header>
          Tallying in progress
        </Header>
        {countedVotes}/{voteCount}
        <br />
        Valid votes : {validVotes}
      </div>
    )
  }
  else if (status === '4') {
    return (
      <div>
        <Header>
          Voting has finished
        </Header>
        {countedVotes}/{voteCount}
        <br />
        Valid votes : {validVotes}
      </div>
    );
  }
  else { // Preparation/Registration
    return (
      <div>
        <Header>
          Voting has not started yet
        </Header>
      </div>
    );
  }
}

function StartTally(props) {
  const {endVotingTime, startTallyCallback, status, currentBlockTimestamp} = props;
  const [decKey, setDecKey] = useState('');

  const invalidNumber = (value) => {
    return value === '' || value <= 0 || typeof(value) !== 'number' || isNaN(value);
  }

  if (status !== '2' || !endVotingTime) {
    return (
      <div></div>
    );
  }

  return (
    <div>
      <Divider />
      <Input
        fluid
        placeholder='Vote decryption key D...'
        onChange={(e) => setDecKey(e.target.value)}
      />
      <Button
        primary
        onClick={() => startTallyCallback(decKey)}
        disabled={currentBlockTimestamp < parseInt(endVotingTime) || invalidNumber(parseInt(decKey))}
      >
        Start Tally
      </Button>
    </div>
  );
}

function Tally(props) {
  const {status, handleTally, votesLeft} = props;
  const [votesToTally, setVotesToTally] = useState(-1);

  const invalidNumber = (value) => {
    return value === '' || value <= 0 || typeof(value) !== 'number' || isNaN(value);
  }

  if (status !== '3') {
    return (
      <div></div>
    );
  }

  return (
    <div>
      <br />
      <Input
        fluid
        placeholder='Number of votes to tally...'
        onChange={(e) => setVotesToTally(parseInt(e.target.value))}
      />
      <Button
        primary
        disabled={invalidNumber(votesToTally) || votesToTally > votesLeft}
        onClick={() => handleTally(votesToTally)}
      >
        Tally votes
      </Button>
    </div>
  );
}

class VoteTallyingOrganizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataKeyStatus: null,
      dataKeyEndVotingTime: null,
      dataKeyVoteCount: null,
      dataKeyCountedVotes: null,
      dataKeyValidVotes: null,
      dataKeyCandidates: null,
      dataKeyCandidateIds: null,
      dataKeyCandidateCount: null,
      dataKeyPubKeyE: null,
      dataKeyPubKeyN: null,
      stackIdEndVoting: null,
      stackIdTally: null,
      currentBlockTimestamp: 0,
      validVotes: 0
    }
  }

  componentDidMount() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const dataKeyStatus = contract.methods.state.cacheCall();
    const dataKeyEndVotingTime = contract.methods.endVotingTime.cacheCall();
    const dataKeyVoteCount = contract.methods.voteCount.cacheCall();
    const dataKeyCountedVotes = contract.methods.countedVotes.cacheCall();
    const dataKeyValidVotes = contract.methods.validVotes.cacheCall();
    const dataKeyCandidateCount = contract.methods.candidateCount.cacheCall();
    const dataKeyPubKeyE = contract.methods.pubKeyE.cacheCall();
    const dataKeyPubKeyN = contract.methods.pubKeyN.cacheCall();
    this.setState({
      dataKeyStatus,
      dataKeyEndVotingTime,
      dataKeyVoteCount,
      dataKeyCountedVotes,
      dataKeyValidVotes,
      dataKeyCandidateCount,
      dataKeyPubKeyE,
      dataKeyPubKeyN
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const {VotingContract} = this.props.drizzleState.contracts;

    const validVotes = VotingContract.validVotes[this.state.dataKeyValidVotes];
    const candidateCount = VotingContract.candidateCount[this.state.dataKeyCandidateCount];
    let dataKeyCandidateIds = [];
    if ((this.state.dataKeyCandidateIds && parseInt(candidateCount.value) !== this.state.dataKeyCandidateIds.length) || validVotes !== this.state.validVotes) {
      // There is a change in candidateCount, reset dataKeys
      this.setState({
        validVotes: validVotes,
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
    else if (this.state.dataKeyCandidateIds && this.state.dataKeyCandidates == null) {
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

    // Get most recent block timestamp
    if (this.state.currentBlockTimestamp === 0 || this.state.currentBlockTimestamp !== prevState.currentBlockTimestamp) {
      drizzle.web3.eth.getBlock('latest').then((result) => this.setState({ currentBlockTimestamp: result.timestamp }));
    }
  }

  checkPrivateKey = (pubKeyN, pubKeyE, priKeyD) => {
    // Checks if private key is correct by encrypting and decrypting checkString
    const checkString = "Check String";
    const bigIntPubN = new BigInteger(pubKeyN.toString());
    const bigIntPubE = new BigInteger(pubKeyE.toString());
    const bigIntPriD = new BigInteger(priKeyD.toString());
    const bigIntString = new BigInteger(checkString);
    const encryptedString = bigIntString.modPow(bigIntPubE, bigIntPubN);
    const decryptedString = encryptedString.modPow(bigIntPriD, bigIntPubN);
    return bigIntString.toString() === decryptedString.toString();
  }

  handleStartTally = (decKey) => {
    const {drizzle, drizzleState} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const {VotingContract} = drizzleState.contracts;

    const pubKeyN = VotingContract.pubKeyN[this.state.dataKeyPubKeyN].value;
    const pubKeyE = VotingContract.pubKeyE[this.state.dataKeyPubKeyE].value;
    if (!this.checkPrivateKey(pubKeyN, pubKeyE, decKey)) {
      console.log("Wrong private key");
      return;
    }

    const stackId = contract.methods.endVoting.cacheSend(
      decKey,
      { from: drizzleState.accounts[0] }
    );
    this.setState({ stackIdEndVoting: stackId });
  }

  handleTally = (votesToTally) => {
    const {drizzle, drizzleState} = this.props;
    const contract = drizzle.contracts.VotingContract;

    const stackId = contract.methods.tally.cacheSend(
      votesToTally,
      { from: drizzleState.accounts[0] }
    );
    this.setState({ stackIdTally: stackId });
  }

  render() {
    const {VotingContract} = this.props.drizzleState.contracts;
    const status = VotingContract.state[this.state.dataKeyStatus];
    const endVotingTime = VotingContract.endVotingTime[this.state.dataKeyEndVotingTime];
    const voteCount = VotingContract.voteCount[this.state.dataKeyVoteCount];
    const countedVotes = VotingContract.countedVotes[this.state.dataKeyCountedVotes];
    const validVotes = this.state.validVotes;

    return (
      <div>
        <EndVotingInfo
          endVotingTime={endVotingTime ? endVotingTime.value : null}
          status={status ? status.value : null}
          countedVotes={countedVotes ? countedVotes.value : '-'}
          validVotes={validVotes ? validVotes.value : '-'}
          voteCount={voteCount ? voteCount.value : '-'}
        />
        <StartTally
          endVotingTime={endVotingTime ? endVotingTime.value : null}
          startTallyCallback={this.handleStartTally}
          status={status ? status.value : null}
          currentBlockTimestamp={this.state.currentBlockTimestamp}
        />
        <TallyResult
          candidates={this.state.candidates ? this.state.candidates : []}
          status={status ? status.value : null}
        />
        <Tally
          status={status ? status.value : null}
          handleTally={this.handleTally}
          votesLeft={voteCount && countedVotes ? parseInt(voteCount.value) - parseInt(countedVotes.value) : -1}
        />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdTally} />
      </div>
    );
  }
}

export default VoteTallyingOrganizer;