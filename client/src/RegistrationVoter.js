import React, { Component, useState } from "react";
import { Button, Input } from 'semantic-ui-react';
import * as Utils from 'web3-utils';

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
        address: getAccountAddress(),
        name: name,
        NIK: NIK
      })}>
        Register
      </Button>
    </div>
  );
}

function getAccountAddress() {
  return 'Account Address';
}

class RegistrationVoter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    }
  }

  handleRegisterVoter(voterInfo) {
    let hashedNIK = Utils.soliditySha3(voterInfo.NIK);
    console.log(`Register voter : \n\t
      Address : ${voterInfo.address} \n\t
      Name : ${voterInfo.name} \n\t
      Hashed NIK : ${hashedNIK}`);
  }

  render() {
    return (
      <div>
        <RegisterVoter onClick={(voterInfo) => this.handleRegisterVoter(voterInfo)}/>
      </div>
    );
  }
}

export default RegistrationVoter;