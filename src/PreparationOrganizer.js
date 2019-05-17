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

class PreparationOrganizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    }
  }

  handleAddOrganizer(publicAddress) {
    console.log("Add organizer : " + publicAddress);
  }

  render() {
    return (
      <div>
        <AddOrganizer onClick={(publicAddress) => this.handleAddOrganizer(publicAddress)} />
      </div>
    );
  }
}

export default PreparationOrganizer;