import React, { Component, useState } from "react";
import { Input } from 'semantic-ui-react';

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

  render() {
    return (
      <div>
        <AddOrganizer onClick={(publicAddress) => this.handleAddOrganizer(publicAddress)} />
        <AddCandidate onClick={(candidateInfo) => this.handleAddCandidate(candidateInfo)} />
      </div>
    );
  }
}

export default PreparationOrganizer;