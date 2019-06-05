import React, { Component, useState } from "react";
import { Button, Divider, Input } from 'semantic-ui-react';

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
  return (
    <div>
      <Button primary onClick={() => props.onClick()}>
        End Preparation Phase
      </Button>
    </div>
  );
}

function TxStatus(props) {
  const {transactions, transactionStack} = props.drizzleState;
  const txHash = transactionStack[props.stackId];
  if (!txHash || !transactions[txHash]) return null;
  console.log(transactions[txHash]);
  return (
    `Transaction Status: ${transactions[txHash].status}`
  );
}

class PreparationOrganizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stackIdAddCandidate: null,
      stackIdAddOrganizer: null,
      stackIdEndPreparation: null
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
    return (
      <div>
        <AddOrganizer onClick={(address, name, N, E) => this.handleAddOrganizer(address, name, N, E)} />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdAddOrganizer} />
        <Divider />
        <AddCandidate onClick={(candidateName) => this.handleAddCandidate(candidateName)} />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdAddCandidate} />
        <Divider />
        <EndPreparationPhase onClick={() => this.handleEndPreparationPhase()} />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdEndPreparation} />
      </div>
    );
  }
}

export default PreparationOrganizer;