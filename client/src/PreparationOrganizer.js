import React, { Component, useState } from "react";
import { Button, Divider, Input } from 'semantic-ui-react';
import TxStatus from './TxStatus';

function AddOrganizer(props) {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [N, setN] = useState('');
  const [E, setE] = useState('');

  return (
    <div>
      <Input
        fluid
        placeholder='New Organizer Address...'
        onChange={(e) => setAddress(e.target.value)}
      />
      <Input
        fluid
        placeholder='New Organizer Name...'
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        fluid
        placeholder='New Organizer Sign Key N...'
        onChange={(e) => setN(e.target.value)}
      />
      <Input
        fluid
        placeholder='New Organizer Sign Key E...'
        onChange={(e) => setE(e.target.value)}
      />
      <Button
        primary
        onClick={(e) => props.onClick(address, name, N, E)}
        content="Add New Organizer"
      />
      <br />
      <br />
    </div>
  );
}

function AddCandidate(props) {
  const [value, setValue] = useState('');

  return (
    <div>
      <Input
        fluid
        action={{
          content: 'Add New Candidate',
          onClick: () => props.onClick(value)
        }}
        placeholder='Candidate name...'
        onChange={(e) => setValue(e.target.value)}
      />
      <br />
    </div>
  );
}

function EndPreparationPhase(props) {
  const {status, currentBlockTimestamp, endPreparationTime} = props;

  return (
    <div>
      <Button
        primary
        onClick={() => props.onClick()}
        disabled={status !== '0' || currentBlockTimestamp < parseInt(endPreparationTime)}
      >
        End Preparation Phase
      </Button>
    </div>
  );
}

class PreparationOrganizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataKeyStatus: null,
      dataKeyEndPreparationTime: null,
      stackIdAddCandidate: null,
      stackIdAddOrganizer: null,
      stackIdEndPreparation: null,
      currentBlockTimestamp: 0
    }
  }

  componentDidMount() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const dataKeyStatus = contract.methods.state.cacheCall();
    const dataKeyEndPreparationTime = contract.methods.endPreparationTime.cacheCall();
    this.setState({
      dataKeyStatus,
      dataKeyEndPreparationTime
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {drizzle} = this.props;

    // Get most recent block timestamp
    if (this.state.currentBlockTimestamp === 0 || this.state.currentBlockTimestamp !== prevState.currentBlockTimestamp) {
      drizzle.web3.eth.getBlock('latest').then((result) => this.setState({ currentBlockTimestamp: result.timestamp }));
    }
  }

  handleAddOrganizer(address, name, N, E) {
    const {drizzle, drizzleState} = this.props;
    const contract = drizzle.contracts.VotingContract;

    const stackId = contract.methods.addOrganizer.cacheSend(
      address,
      name,
      N,
      E,
      { from: drizzleState.accounts[0] }
    );
    this.setState({ stackIdAddOrganizer: stackId });
  }

  handleAddCandidate(candidateName) {
    const {drizzle, drizzleState} = this.props;
    const contract = drizzle.contracts.VotingContract;

    const stackId = contract.methods.addCandidate.cacheSend(
      candidateName,
      { from: drizzleState.accounts[0] }
    );
    this.setState({ stackIdAddCandidate: stackId });
  }

  handleEndPreparationPhase() {
    const {drizzle, drizzleState} = this.props;
    const contract = drizzle.contracts.VotingContract;

    const stackId = contract.methods.endPreparation.cacheSend(
      { from: drizzleState.accounts[0] }
    );
    this.setState({ stackIdEndPreparation: stackId });
  }

  render() {
    const {VotingContract} = this.props.drizzleState.contracts;
    const status = VotingContract.state[this.state.dataKeyStatus];
    const endPreparationTime = VotingContract.state[this.state.dataKeyEndPreparationTime];

    return (
      <div>
        <AddOrganizer onClick={(address, name, N, E) => this.handleAddOrganizer(address, name, N, E)} />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdAddOrganizer} />
        <Divider />
        <AddCandidate onClick={(candidateName) => this.handleAddCandidate(candidateName)} />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdAddCandidate} />
        <Divider />
        <EndPreparationPhase
          onClick={() => this.handleEndPreparationPhase()}
          status={status ? status.value : null}
          currentBlockTimestamp={this.state.currentBlockTimestamp}
          endPreparationTime={endPreparationTime ? endPreparationTime.value : null}
        />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdEndPreparation} />
      </div>
    );
  }
}

export default PreparationOrganizer;