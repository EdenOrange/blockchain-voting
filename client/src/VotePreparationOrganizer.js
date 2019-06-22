import React, { Component, useState } from "react";
import { Button, Header, Form, Input, List, Modal, TextArea } from 'semantic-ui-react';
import * as BlindSignature from './rsablind.js';
import { BigInteger } from 'jsbn';
import TxStatus from './TxStatus';

function BlindSigRequests(props) {
  const {requests, organizerAddress, handleSign} = props;
  const Requests = requests.map((request) => {
    if (request.organizerAddress === organizerAddress) {
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
      dataKeyBlindSigRequests: null,
      dataKeyBlinds: null,
      dataKeyBlindCount: null,
      dataKeyOrganizers: null,
      dataKeyOrganizerAddresses: null,
      dataKeyOrganizerCount: null,
      blindSigRequests: null,
      organizers: null,
      stackIdSignBlindSigRequest: null
    }
  }

  componentDidMount() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const dataKeyBlindCount = contract.methods.blindCount.cacheCall();
    const dataKeyOrganizerCount = contract.methods.organizerCount.cacheCall();
    this.setState({
      dataKeyBlindCount,
      dataKeyOrganizerCount
    });
  }

  componentDidUpdate() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const {VotingContract} = this.props.drizzleState.contracts;

    const blindCount = VotingContract.blindCount[this.state.dataKeyBlindCount];
    let dataKeyBlinds = [];
    if (this.state.dataKeyBlinds && parseInt(blindCount.value) !== this.state.dataKeyBlinds.length) {
      // There is a change in blindCount, reset dataKeys
      this.setState({
        dataKeyBlindSigRequests: null,
        dataKeyBlinds: null,
        blindSigRequests: null
      })
    }
    else if (blindCount && this.state.dataKeyBlinds == null) {
      for (let i = 0; i < blindCount.value; i++) {
        dataKeyBlinds.push(contract.methods.blinds.cacheCall(i));
      }
      this.setState({ dataKeyBlinds: dataKeyBlinds });
    }
    else if (this.state.dataKeyBlinds && this.state.dataKeyBlindSigRequests == null && VotingContract.blinds[this.state.dataKeyBlinds[this.state.dataKeyBlinds.length-1]]) {
      // Only do this if all dataKeyBlinds are already loaded
      let dataKeyBlindSigRequests = [];
      for (const dataKeyBlind of this.state.dataKeyBlinds) {
        const blind = VotingContract.blinds[dataKeyBlind];
        dataKeyBlindSigRequests.push(contract.methods.blindSigRequests.cacheCall(blind.value));
      }

      this.setState({ dataKeyBlindSigRequests: dataKeyBlindSigRequests });
    }
    else if (this.state.dataKeyBlindSigRequests && this.state.blindSigRequests == null && VotingContract.blindSigRequests[this.state.dataKeyBlindSigRequests[this.state.dataKeyBlindSigRequests.length-1]]) {
      // Only do this if all dataKeyBlindSigRequests are already loaded
      let blindSigRequests = [];
      for (let i = 0; i < this.state.dataKeyBlindSigRequests.length; i++) {
        const dataKeyBlindSigRequest = this.state.dataKeyBlindSigRequests[i];
        const blindSigRequest = VotingContract.blindSigRequests[dataKeyBlindSigRequest];
        // Create organizer object
        blindSigRequests.push({
          index: i,
          requesterAddress: blindSigRequest.value.requester,
          organizerAddress: blindSigRequest.value.signer,
          blinded: blindSigRequest.args[0]
        });
      }
      this.setState({ blindSigRequests: blindSigRequests });
    }

    const organizerCount = VotingContract.organizerCount[this.state.dataKeyOrganizerCount];
    let dataKeyOrganizerAddresses = [];
    if (this.state.dataKeyOrganizerAddresses && parseInt(organizerCount.value) !== this.state.dataKeyOrganizerAddresses.length) {
      // There is a change in organizerCount, reset dataKeys
      this.setState({
        dataKeyOrganizers: null,
        dataKeyOrganizerAddresses: null,
        organizers: null
      })
    }
    else if (organizerCount && this.state.dataKeyOrganizerAddresses == null) {
      for (let i = 0; i < organizerCount.value; i++) {
        dataKeyOrganizerAddresses.push(contract.methods.organizerAddresses.cacheCall(i));
      }
      this.setState({ dataKeyOrganizerAddresses: dataKeyOrganizerAddresses });
    }
    else if (this.state.dataKeyOrganizerAddresses && this.state.dataKeyOrganizers == null && VotingContract.organizerAddresses[this.state.dataKeyOrganizerAddresses[this.state.dataKeyOrganizerAddresses.length-1]]) {
      // Only do this if all dataKeyOrganizerAddresses are already loaded
      let dataKeyOrganizers = [];
      for (const dataKeyOrganizerAddress of this.state.dataKeyOrganizerAddresses) {
        const organizerAddress = VotingContract.organizerAddresses[dataKeyOrganizerAddress];
        dataKeyOrganizers.push(contract.methods.organizers.cacheCall(organizerAddress.value));
      }

      this.setState({ dataKeyOrganizers: dataKeyOrganizers });
    }
    else if (this.state.dataKeyOrganizers && this.state.organizers == null && VotingContract.organizers[this.state.dataKeyOrganizers[this.state.dataKeyOrganizers.length-1]]) {
      // Only do this if all dataKeyOrganizers are already loaded
      let organizers = [];
      for (let i = 0; i < this.state.dataKeyOrganizers.length; i++) {
        const dataKeyOrganizer = this.state.dataKeyOrganizers[i];
        const organizer = VotingContract.organizers[dataKeyOrganizer];
        // Create organizer object
        organizers.push({
          id: i,
          address: organizer.args[0],
          name: organizer.value.name,
          blindSigKey: {
            N: organizer.value.N,
            E: organizer.value.E
          }
        });
      }
      this.setState({ organizers: organizers });
    }
  }
  
  getCurrentOrganizerObject = () => {
    const {drizzleState} = this.props;
    return this.state.organizers.find(organizer => organizer.address === drizzleState.accounts[0]);
  }

  handleSign = (request, privateKey) => {
    console.log("Sign ballot " + request.blinded + " with privateKey : " + privateKey);
    const key = {
      keyPair: {
        e: new BigInteger(this.getCurrentOrganizerObject().blindSigKey.E.toString()),
        n: new BigInteger(this.getCurrentOrganizerObject().blindSigKey.N.toString()),
        d: new BigInteger(privateKey.toString())
      }
    }
    const signed = BlindSignature.sign({
      blinded: request.blinded,
      key: key
    });
    console.log("Signed : " + signed);
    this.sendSigned(
      request.index,
      request.requesterAddress,
      request.blinded,
      signed.toString()
    );
  }

  sendSigned = (index, requesterAddress, blinded, signed) => {
    const {drizzle, drizzleState} = this.props;
    const contract = drizzle.contracts.VotingContract;

    console.log("Sending", index, requesterAddress, blinded, signed);
    const stackId = contract.methods.signBlindSigRequest.cacheSend(
      index,
      requesterAddress,
      blinded,
      signed,
      { from: drizzleState.accounts[0] }
    );
    this.setState({
      stackIdSignBlindSigRequest: stackId
    });
  }

  render() {
    const {drizzleState} = this.props;
    return (
      <div>
        <BlindSigRequests requests={this.state.blindSigRequests ? this.state.blindSigRequests : []} organizerAddress={drizzleState.accounts[0]} handleSign={this.handleSign} />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdSignBlindSigRequest} />
      </div>
    );
  }
}

export default VotePreparationOrganizer;