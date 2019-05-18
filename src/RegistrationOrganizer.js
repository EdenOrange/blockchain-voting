import React, { Component } from "react";
import { Button, List } from 'semantic-ui-react';

function VoterRegistrationRequests(props) {
  const {requests, handleRegisterVoter} = props;
  const Requests = requests.map((request) => VoterRegistrationRequest(request, handleRegisterVoter));

  return (
    <List divided>
      {Requests}
    </List>
  )
}

function VoterRegistrationRequest(request, registerCallback) {
  return (
    <List.Item key={request.address}>
      <List.Content floated='right'>
        <Button primary onClick={() => registerCallback(request)}>Register Voter</Button>
      </List.Content>
      <List.Content>
        <List.Item>
          {request.name}
        </List.Item>
        <List.Item>
          Address : {request.address}
        </List.Item>
        <List.Item>
          HashedNIK : {request.hashedNIK}
        </List.Item>
      </List.Content>
    </List.Item>
  );
}

class RegistrationOrganizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requests: [
        {
          address: '0xAddress001',
          name: 'Name001',
          hashedNIK: 'HashedNIK001'
        },
        {
          address: '0xAddress002',
          name: 'Name002',
          hashedNIK: 'HashedNIK002'
        },
        {
          address: '0xAddress003',
          name: 'Name003',
          hashedNIK: 'HashedNIK003'
        }
      ]
    }
  }

  handleRegisterVoter(request) {
    console.log(`Register ${request.address} as eligible voter`);
  }

  render() {
    return (
      <div>
        <VoterRegistrationRequests requests={this.state.requests} handleRegisterVoter={this.handleRegisterVoter}/>
      </div>
    );
  }
}

export default RegistrationOrganizer;