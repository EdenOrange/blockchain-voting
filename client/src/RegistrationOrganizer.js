import React, { Component, useState } from "react";
import { Button, Divider, Header, Input, List, Modal } from 'semantic-ui-react';
import * as Utils from 'web3-utils';
import TxStatus from './TxStatus';

function VoterRegistrationRequests(props) {
  const {requests, handleRegisterVoter} = props;
  const Requests = requests.map((request) => 
    <VoterRegistrationRequest 
      request={request} 
      handleRegisterVoter={handleRegisterVoter}
      key={request.hashedNIK}
    />
  );

  return (
    <List divided>
      {Requests}
    </List>
  )
}

class VoterRegistrationRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      NIK: '',
      hashedNIK: '',
      modalOpen: false
    }
  }

  render() {
    const {request, handleRegisterVoter} = this.props;
    const {hashedNIK} = this.state;

    let disableRegister = hashedNIK !== request.hashedNIK;
    let handleChangeNIK = (value) => {
      this.setState({
        hashedNIK: value !== '' && Utils.soliditySha3(value)
      });
      disableRegister = hashedNIK !== request.hashedNIK;
    }

    let handleOpen = () => {
      this.setState({ modalOpen: true });
    }
    let handleClose = () => {
      this.setState({
        modalOpen: false,
        NIK: '',
        hashedNIK: ''
      });
    };;

    return (
      <List.Item>
        <List.Content floated='right'>
          <Modal
            trigger={<Button primary onClick={handleOpen}>Register Voter</Button>}
            open={this.state.modalOpen}
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
                onChange={(e) => {this.setState({ NIK: e.target.value }); handleChangeNIK(e.target.value)}}
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
              <Button primary disabled={disableRegister} onClick={() => {handleRegisterVoter(request); handleClose()}}>
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
}

function EndRegistrationPhase(props) {
  const {status, currentBlockTimestamp, endRegistrationTime} = props;
  const [pubKeyN, setPubKeyN] = useState('');
  const [pubKeyE, setPubKeyE] = useState('');

  const invalidNumber = (value) => {
    return value === '' || value <= 0 || typeof(value) !== 'number' || isNaN(value);
  }

  return (
    <div>
      <Input
        placeholder='Vote decryption key N...'
        onChange={(e) => setPubKeyN(e.target.value)}
      />
      <br />
      <Input
        placeholder='Vote decryption key E...'
        onChange={(e) => setPubKeyE(e.target.value)}
      />
      <br />
      <Button
        primary
        onClick={() => props.onClick(pubKeyN, pubKeyE)}
        disabled={status !== '1' || currentBlockTimestamp < parseInt(endRegistrationTime) || invalidNumber(parseInt(pubKeyN)) || invalidNumber(parseInt(pubKeyE))}
      >
        End Registration Phase
      </Button>
    </div>
  );
}

class RegistrationOrganizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataKeyStatus: null,
      dataKeyEndRegistrationTime: null,
      dataKeyRegisterRequests: null,
      dataKeyRegisters: null,
      dataKeyRegisterCount: null,
      registerRequests: null,
      stackIdRegisterVoter: null,
      stackIdEndRegistration: null,
      currentBlockTimestamp: 0
    }
    this.handleRegisterVoter = this.handleRegisterVoter.bind(this);
  }

  componentDidMount() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const dataKeyStatus = contract.methods.state.cacheCall();
    const dataKeyEndRegistrationTime = contract.methods.endRegistrationTime.cacheCall();
    const dataKeyRegisterCount = contract.methods.registerCount.cacheCall();
    this.setState({
      dataKeyStatus,
      dataKeyEndRegistrationTime,
      dataKeyRegisterCount
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const {VotingContract} = this.props.drizzleState.contracts;

    const registerCount = VotingContract.registerCount[this.state.dataKeyRegisterCount];
    let dataKeyRegisters = [];
    if (this.state.dataKeyRegisters && parseInt(registerCount.value) !== this.state.dataKeyRegisters.length) {
      // There is a change in registerCount, reset dataKeys
      this.setState({
        dataKeyRegisterRequests: null,
        dataKeyRegisters: null,
        registerRequests: null
      })
    }
    else if (registerCount && this.state.dataKeyRegisters == null) {
      for (let i = 0; i < registerCount.value; i++) {
        dataKeyRegisters.push(contract.methods.registers.cacheCall(i));
      }
      this.setState({ dataKeyRegisters: dataKeyRegisters });
    }
    else if (this.state.dataKeyRegisters && this.state.dataKeyRegisterRequests == null) {
      for (const dataKeyRegisterRequest of this.state.dataKeyRegisters) {
        const registerRequest = VotingContract.registers[dataKeyRegisterRequest];
        if (!registerRequest) {
          return;
        }
      }

      // Only do this if all dataKeyRegisters are already loaded
      let dataKeyRegisterRequests = [];
      for (const dataKeyRegisterRequest of this.state.dataKeyRegisters) {
        const registerRequest = VotingContract.registers[dataKeyRegisterRequest];
        dataKeyRegisterRequests.push(contract.methods.registerRequests.cacheCall(registerRequest.value));
      }

      this.setState({ dataKeyRegisterRequests: dataKeyRegisterRequests });
    }
    else if (this.state.dataKeyRegisterRequests && this.state.registerRequests == null) {
      for (let i = 0; i < this.state.dataKeyRegisterRequests.length; i++) {
        const dataKeyRegisterRequest = this.state.dataKeyRegisterRequests[i];
        const registerRequest = VotingContract.registerRequests[dataKeyRegisterRequest];
        if (!registerRequest) {
          return;
        }
      }
      
      // Only do this if all dataKeyRegisterRequests are already loaded
      let registerRequests = [];
      for (let i = 0; i < this.state.dataKeyRegisterRequests.length; i++) {
        const dataKeyRegisterRequest = this.state.dataKeyRegisterRequests[i];
        const registerRequest = VotingContract.registerRequests[dataKeyRegisterRequest];

        // Create register request object
        registerRequests.push({
          index: i,
          address: registerRequest.value.registrarAddress,
          name: registerRequest.value.name,
          hashedNIK: registerRequest.args[0]
        });
      }

      this.setState({ registerRequests: registerRequests });
    }

    // Get most recent block timestamp
    if (this.state.currentBlockTimestamp === 0 || this.state.currentBlockTimestamp !== prevState.currentBlockTimestamp) {
      drizzle.web3.eth.getBlock('latest').then((result) => this.setState({ currentBlockTimestamp: result.timestamp }));
    }
  }

  handleRegisterVoter(request) {
    const {drizzle, drizzleState} = this.props;
    const contract = drizzle.contracts.VotingContract;

    const stackId = contract.methods.registerVoter.cacheSend(
      request.index,
      request.hashedNIK,
      request.address,
      request.name,
      { from: drizzleState.accounts[0] }
    );
    this.setState({
      stackIdRegisterVoter: stackId
    });
  }

  handleEndRegistrationPhase(pubKeyN, pubKeyE) {
    const {drizzle, drizzleState} = this.props;
    const contract = drizzle.contracts.VotingContract;

    const stackId = contract.methods.endRegistration.cacheSend(
      pubKeyN,
      pubKeyE,
      { from: drizzleState.accounts[0] }
    );
    this.setState({ stackIdEndRegistration: stackId });
  }

  render() {
    const {VotingContract} = this.props.drizzleState.contracts;
    const status = VotingContract.state[this.state.dataKeyStatus];
    const endRegistrationTime = VotingContract.endRegistrationTime[this.state.dataKeyEndRegistrationTime];

    return (
      <div>
        <VoterRegistrationRequests requests={this.state.registerRequests ? this.state.registerRequests : []} handleRegisterVoter={this.handleRegisterVoter}/>
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdRegisterVoter} />
        <Divider />
        <EndRegistrationPhase
          onClick={(pubKeyN, pubKeyE) => this.handleEndRegistrationPhase(pubKeyN, pubKeyE)}
          status={status ? status.value : null}
          currentBlockTimestamp={this.state.currentBlockTimestamp}
          endRegistrationTime={endRegistrationTime ? endRegistrationTime.value : null}
        />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdEndRegistration} />
      </div>
    );
  }
}

export default RegistrationOrganizer;