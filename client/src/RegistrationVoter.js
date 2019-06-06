import React, { Component, useState } from "react";
import { Button, Input } from 'semantic-ui-react';
import * as Utils from 'web3-utils';
import TxStatus from './TxStatus';

function RegisterVoter(props) {
  const [name, setName] = useState('');
  const [NIK, setNIK] = useState('');

  return (
    <div>
      <Input
        fluid
        placeholder='Name...'
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <Input
        fluid
        placeholder='NIK...'
        onChange={(e) => setNIK(e.target.value)}
      />
      <br />
      <Button primary onClick={() => props.onClick({
        name: name,
        NIK: NIK
      })}>
        Register
      </Button>
    </div>
  );
}

class RegistrationVoter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stackIdRegisterRequest: null
    }
  }

  handleRegisterVoter(voterInfo) {
    const {drizzle, drizzleState} = this.props;
    const contract = drizzle.contracts.VotingContract;

    let hashedNIK = Utils.soliditySha3(voterInfo.NIK);
    const stackId = contract.methods.registerRequest.cacheSend(
      voterInfo.name,
      hashedNIK,
      { from: drizzleState.accounts[0] }
    );
    this.setState({ stackIdRegisterRequest: stackId });
  }

  render() {
    return (
      <div>
        <RegisterVoter onClick={(voterInfo) => this.handleRegisterVoter(voterInfo)} />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdRegisterRequest} />
      </div>
    );
  }
}

export default RegistrationVoter;