import React, { Component, useState } from "react";
import { Button, Input } from 'semantic-ui-react';

function AddOrganizer(props) {
  const [value, setValue] = useState('');

  return (
    <div>
      <Input
        fluid
        action={{
          content: 'Add New Organizer',
          onClick: () => props.onClick(value)
        }}
        placeholder='New Organizer public address...'
        onChange={(e) => setValue(e.target.value)}
      />
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

function AddCandidateTxStatus(props) {
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
      stackIdAddCandidate: null
    }
  }

  handleAddOrganizer(publicAddress) {
    console.log("Add organizer : " + publicAddress);
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
    console.log("End preparation phase");
  }

  render() {
    return (
      <div>
        <AddOrganizer onClick={(publicAddress) => this.handleAddOrganizer(publicAddress)} />
        <AddCandidate onClick={(candidateName) => this.handleAddCandidate(candidateName)} />
        <AddCandidateTxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdAddCandidate} />
        <EndPreparationPhase onClick={() => this.handleEndPreparationPhase()} />
      </div>
    );
  }
}

export default PreparationOrganizer;