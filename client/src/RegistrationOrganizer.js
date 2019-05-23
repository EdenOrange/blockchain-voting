import React, { Component, useState } from "react";
import { Button, Header, Input, List, Modal } from 'semantic-ui-react';
import * as Utils from 'web3-utils';

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
  const [, setNIK] = useState('');
  const [hashedNIK, setHashedNIK] = useState('');
  let disableRegister = hashedNIK !== request.hashedNIK;
  let handleChangeNIK = (value) => {
    setHashedNIK(value !== '' && Utils.soliditySha3(value));
    disableRegister = hashedNIK !== request.hashedNIK;
  }

  const [modalOpen, setModalOpen] = useState(false);
  let handleOpen = () => setModalOpen(true);
  let handleClose = () => {
    setModalOpen(false);
    setNIK('');
    setHashedNIK('');
  };;

  return (
    <List.Item key={request.address}>
      <List.Content floated='right'>
        <Modal
          trigger={<Button primary onClick={handleOpen}>Register Voter</Button>}
          open={modalOpen}
          onClose={handleClose}
        >
          <Modal.Header>
            Confirm NIK
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <Header>
                Name
              </Header>
              {request.name}
              <Header>
                Voter hashed NIK
              </Header>
              {request.hashedNIK}
            </Modal.Description>
            <br />
            <br />
            <Input
              fluid
              placeholder='NIK...'
              onChange={(e) => {setNIK(e.target.value); handleChangeNIK(e.target.value)}}
            />
            <br />
            <Modal.Description>
              <Header>
                Hashed NIK result
              </Header>
              {hashedNIK}
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button primary disabled={disableRegister} onClick={() => {registerCallback(request); handleClose()}}>
              Register
            </Button>
            <Button negative onClick={handleClose}>
              Cancel
            </Button>
          </Modal.Actions>
        </Modal>
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
          name: 'Name1',
          hashedNIK: '0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6'
        },
        {
          address: '0xAddress002',
          name: 'Name123',
          hashedNIK: '0x5569044719a1ec3b04d0afa9e7a5310c7c0473331d13dc9fafe143b2c4e8148a'
        },
        {
          address: '0xAddress003',
          name: 'NameAs Df',
          hashedNIK: '0xeeb1894b9a65d7d3d57e261a351b0e61bbc133a6627c74fb4cc75d7e5bf913d6'
        }
      ]
    }
  }

  handleRegisterVoter(request) {
    console.log(`Register ${request.address}(${request.name}) as eligible voter`);
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