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

class PreparationOrganizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    }
  }

  handleAddOrganizer(publicAddress) {
    console.log("Add organizer : " + publicAddress);
  }

  handleAddCandidate(candidateInfo) {
    console.log("Add candidate : " + candidateInfo);
  }

  handleEndPreparationPhase() {
    console.log("End preparation phase");
  }

  render() {
    return (
      <div>
        <AddOrganizer onClick={(publicAddress) => this.handleAddOrganizer(publicAddress)} />
        <AddCandidate onClick={(candidateInfo) => this.handleAddCandidate(candidateInfo)} />
        <EndPreparationPhase onClick={() => this.handleEndPreparationPhase()} />
      </div>
    );
  }
}

export default PreparationOrganizer;