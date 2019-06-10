import React, { Component, useState } from "react";
import { Button, Divider, Header, Input } from 'semantic-ui-react';
import TxStatus from './TxStatus';
import TallyResult from './TallyResult';

// const Status = {
//   0: 'Preparation',
//   1: 'Registration',
//   2: 'Voting',
//   3: 'Tallying',
//   4: 'Finished'
// }

function EndVotingInfo(props) {
  const {endVotingTime, status, countedVotes, voteCount} = props;

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
      </div>
    )
  }
  else if (status === '4') {
    return (
      <div>
        <Header>
          Voting has finished
        </Header>
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
  const {endVotingTime, startTallyCallback, status} = props;
  const currentBlockTimestamp = getCurrentBlockTimestamp();

  if (status !== '2' || !endVotingTime) {
    return (
      <div></div>
    );
  }

  return (
    <div>
      <Divider />
      <Button
        primary
        onClick={startTallyCallback}
        disabled={currentBlockTimestamp < endVotingTime*1000}
      >
        Start Tally
      </Button>
    </div>
  );
}

function Tally(props) {
  const {handleTally, votesLeft} = props;
  const [votesToTally, setVotesToTally] = useState(-1);

  return (
    <div>
      <br />
      <Input
        placeholder='Number of votes to tally...'
        onChange={(e) => setVotesToTally(parseInt(e.target.value))}
      />
      <br />
      <Button
        primary
        disabled={votesToTally === '' || votesToTally <= 0 || votesToTally > votesLeft || typeof(votesToTally) !== 'number' || isNaN(votesToTally)}
        onClick={() => handleTally(votesToTally)}
      >
        Tally votes
      </Button>
    </div>
  );
}

function getCurrentBlockTimestamp() {
  // Get most recent block timestamp
  // return web3.eth.getBlock(web3.eth.blockNumber).timestamp * 1000; // JS timestamp is in milliseconds
  return Date.now();
}

class VoteCountingOrganizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataKeyStatus: null,
      dataKeyEndVotingTime: null,
      dataKeyVoteCount: null,
      dataKeyCountedVotes: null,
      dataKeyCandidates: null,
      dataKeyCandidateIds: null,
      dataKeyCandidateCount: null,
      stackIdEndVoting: null,
      stackIdTally: null
    }
  }

  componentDidMount() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const dataKeyStatus = contract.methods.state.cacheCall();
    const dataKeyEndVotingTime = contract.methods.endVotingTime.cacheCall();
    const dataKeyVoteCount = contract.methods.voteCount.cacheCall();
    const dataKeyCountedVotes = contract.methods.countedVotes.cacheCall();
    const dataKeyCandidateCount = contract.methods.candidateCount.cacheCall();
    this.setState({
      dataKeyStatus,
      dataKeyEndVotingTime,
      dataKeyVoteCount,
      dataKeyCountedVotes,
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

  handleStartTally = () => {
    const {drizzle, drizzleState} = this.props;
    const contract = drizzle.contracts.VotingContract;

    const stackId = contract.methods.endVoting.cacheSend(
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

    return (
      <div>
        <EndVotingInfo
          endVotingTime={endVotingTime ? endVotingTime.value : null}
          status={status ? status.value : null}
          countedVotes={countedVotes ? countedVotes.value : '-'}
          voteCount={voteCount ? voteCount.value : '-'}
        />
        <StartTally
          endVotingTime={endVotingTime ? endVotingTime.value : null}
          startTallyCallback={this.handleStartTally}
          status={status ? status.value : null}
        />
        <TallyResult
          candidates={this.state.candidates ? this.state.candidates : []}
          status={status ? status.value : null}
        />
        <Tally
          handleTally={this.handleTally}
          votesLeft={voteCount && countedVotes ? parseInt(voteCount.value) - parseInt(countedVotes.value) : -1}
        />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdTally} />
      </div>
    );
  }
}

export default VoteCountingOrganizer;