import React, { Component, useState } from "react";
import { Button, Header, Form, Input, List, Modal, TextArea } from 'semantic-ui-react';
import * as BlindSignature from 'blind-signatures';
import { BigInteger } from 'jsbn';

function BlindSigRequests(props) {
  const {requests, organizerId, handleSign} = props;
  const Requests = requests.map((request) => {
    if (request.organizerId === organizerId) {
      return BlindSigRequest(request, handleSign);
    }
    return null;
  });

  return (
    <List divided>
      {Requests}
    </List>
  );
}

function BlindSigRequest(request, signCallback) {
  const [privateKey, setPrivateKey] = useState('');
  let disableSign = privateKey === '';
  const [modalOpen, setModalOpen] = useState(false);
  let handleOpen = () => setModalOpen(true);
  let handleClose = () => {
    setModalOpen(false);
    setPrivateKey('');
  }

  return (
    <List.Item key={request.blinded}>
      <List.Content floated='right'>
      <Modal
          trigger={<Button primary onClick={handleOpen}>Sign this ballot</Button>}
          open={modalOpen}
          onClose={handleClose}
        >
          <Modal.Header>
            Sign this ballot
          </Modal.Header>
          <Modal.Content>
            <Header>
              Blinded vote
            </Header>
            <Form>
              <TextArea value={request.blinded} />
            </Form>
          </Modal.Content>
          <Modal.Content>
            <Input
              fluid
              placeholder='Private key...'
              onChange={(e) => setPrivateKey(e.target.value)}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button primary disabled={disableSign} onClick={() => {signCallback(request, privateKey); handleClose()}}>
              Sign
            </Button>
            <Button negative onClick={handleClose}>
              Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </List.Content>
      <List.Content>
        Address : {request.requesterAddress}
      </List.Content>
    </List.Item>
  );
}

class VotePreparationOrganizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votingContract: {
        blindSigRequests: [
          {
            requesterAddress: '0xAddress001',
            organizerId: '2',
            blinded: '17652845696649741417152511462776404372140482205064679192668900950337268753730'
          },
          {
            requesterAddress: '0xAddress002',
            organizerId: '3',
            blinded: '37750636546558081962522384583041993839860020088555699626376854796142356515839'
          },
          {
            requesterAddress: '0xAddress003',
            organizerId: '1',
            blinded: '30469603815817493807875000129541341432678290297266808979972427283420381282034'
          },
          {
            requesterAddress: '0xAddress004',
            organizerId: '1',
            blinded: '34996292477880701805927129263415091920630509415027671905774620648566170305349'
          },
          {
            requesterAddress: '0xAddress005',
            organizerId: '3',
            blinded: '27844615070844257491998880898393610979157395483180153717177165365073524479138'
          }
        ]
      },
      organizerId: '3', // Selected organizer account id
      organizers: [ // Organizer account
        {
          id: '1',
          address: '0xAddressOrg001',
          name: 'Org1',
          blindSigKey: { // RSA keypair
            N: '78308813544601119203537647274085596537008054539298091635048937059441638602911',
            E: '65537',
            D: '57789149003938058335900251350593951369284013049664342588753780692647486781857'
          }
        },
        {
          id: '2',
          address: '0xAddressOrg002',
          name: 'Org2',
          blindSigKey: {
            N: '58697532336480146441198642100070341275175223310790866838056318326792138477057',
            E: '65537',
            D: '37675975330979047563902254887797106612462090157231312369036798725649986371681'
          }
        },
        {
          id: '3',
          address: '0xAddressOrg003',
          name: 'Org3',
          blindSigKey: {
            N: '67253331087594991077797839859018821584857482008345015897914384596160310638849',
            E: '65537',
            D: '14164483101180610370429583038192727685561262678915432166435964099762577228189'
          }
        }
      ]
    }
  }
  
  getCurrentOrganizerAccount = (organizerId) => {
    return this.state.organizers.find(organizer => organizer.id === organizerId);
  }

  handleSign = (request, privateKey) => {
    console.log("Sign ballot " + request.blinded + " with privateKey : " + privateKey);
    const key = {
      keyPair: {
        e: new BigInteger(this.getCurrentOrganizerAccount(this.state.organizerId).blindSigKey.E.toString()),
        n: new BigInteger(this.getCurrentOrganizerAccount(this.state.organizerId).blindSigKey.N.toString()),
        d: new BigInteger(privateKey.toString())
      }
    }
    const signed = BlindSignature.sign({
      blinded: request.blinded,
      key: key
    });
    console.log("Signed : " + signed);

    // Send signed vote to VotingContract
    const message = {
      requesterAddress: request.requesterAddress,
      signed: signed.toString()
    }
    console.log("Send : " + JSON.stringify(message));
  }

  render() {
    return (
      <div>
        <BlindSigRequests requests={this.state.votingContract.blindSigRequests} organizerId={this.state.organizerId} handleSign={this.handleSign}/>
      </div>
    );
  }
}

export default VotePreparationOrganizer;