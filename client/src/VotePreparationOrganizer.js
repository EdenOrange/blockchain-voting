import React, { Component, useState } from "react";
import { Button, Header, Form, Input, List, Modal, TextArea } from 'semantic-ui-react';
import * as BlindSignature from './rsablind.js';
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
            blinded: '60426752463516873348926488754445044242595969058904053657514082843526071481527'
          },
          {
            requesterAddress: '0xAddress002',
            organizerId: '3',
            blinded: '2567123009865940580716339588244153997372504321992020692242420551839608271491'
          },
          {
            requesterAddress: '0xAddress003',
            organizerId: '1',
            blinded: '71718673910107162727424259620988374895193573839558412358249900876057432719869'
          },
          {
            requesterAddress: '0xAddress004',
            organizerId: '3',
            blinded: '62914212792489438301203135771726128897949536759588274508724916053533957197919'
          },
          {
            requesterAddress: '0xAddress005',
            organizerId: '1',
            blinded: '14931406149964567040796113903350886229955003902462973945590388207327926513582'
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
            N: '76371029918972468664941514738317813949700823831516674062130698696256739747471',
            E: '65537',
            D: '3640433609516303646936498345095211113983443826289371183311928589560399269377'
          }
        },
        {
          id: '2',
          address: '0xAddressOrg002',
          name: 'Org2',
          blindSigKey: {
            N: '84363999601518293055825661401325254763629655239082503904477611930728364455689',
            E: '65537',
            D: '70000609340234726308539353973216137887903167474133405247554605418248129942913'
          }
        },
        {
          id: '3',
          address: '0xAddressOrg003',
          name: 'Org3',
          blindSigKey: {
            N: '67478541602739783545562006148578430599142391044897235744290252182816844486133',
            E: '65537',
            D: '24327982376207876552398478436281965274337410239407425112681983207657454016145'
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