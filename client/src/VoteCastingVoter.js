import React, { Component, useState } from "react";
import { Button, Divider, Form, Header, Input, TextArea } from 'semantic-ui-react';
import * as Utils from 'web3-utils';
import * as BlindSignature from './rsablind.js';
import TxStatus from './TxStatus';
const BigInteger = require('jsbn').BigInteger;

function BallotSignedInfo(props) {
  const {voters, voterAccount} = props;
  const voter = voters.find(voter => voter.address === voterAccount);
  
  if (voter === undefined) {
    return (
      <div>
        <Header>
          This account is not registered in voting
        </Header>
        You may cast your vote from this account
      </div>
    )
  }
  else if (voter.signed === '0') {
    return (
      <div>
        <Header>
          Waiting for Organizer to sign your Ballot
        </Header>
      </div>
    );
  }
  else {
    return (
      <div>
        <Header>
          Organizer has signed your Ballot
        </Header>
        Your voter address : {voter.address}
        <br />
        Your signed ballot : {voter.signed}
        <br />
        Please use another account to cast your vote
      </div>
    )
  }
}

function CastVote(props) {
  const {isAccountRegistered, handleCastVote, drizzleState} = props;
  const [voterAddress, setVoterAddress] = useState('');
  const [voteString, setVoteString] = useState('');
  const [randomValue, setRandomValue] = useState('');

  if (isAccountRegistered(drizzleState.accounts[0])) {
    return (
      <div></div>
    );
  }

  return (
    <div>
      <Divider />
      <br />
      <Input
        fluid
        placeholder='Voter address...'
        onChange={(e) => setVoterAddress(e.target.value)}
      />
      {isAccountRegistered(voterAddress) ? <p style={{color:'green'}}>Valid address</p> : <p style={{color:'red'}}>Invalid address</p>}
      <br />
      <Input
        fluid
        placeholder='Vote string...'
        onChange={(e) => setVoteString(e.target.value)}
      />
      <br />
      <Form>
        <TextArea
          placeholder='Random value...'
          onChange={(e) => setRandomValue(e.target.value)}
        />
      </Form>
      <br />
      <br />
      <Button
        primary
        disabled={voterAddress === '' || voteString === '' || randomValue === '' || !isAccountRegistered(voterAddress)}
        onClick={() => handleCastVote(voterAddress, voteString, randomValue)}
      >
        Cast Vote!
      </Button>
    </div>
  );
}

class VoteCastingVoter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataKeyVoters: null,
      dataKeyVoterAddresses: null,
      dataKeyVoterCount: null,
      dataKeyOrganizers: null,
      dataKeyOrganizerAddresses: null,
      dataKeyOrganizerCount: null,
      dataKeyPubKeyE: null,
      dataKeyPubKeyN: null,
      voters: null,
      organizers: null,
      stackIdVote: null
    }
  }

  componentDidMount() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const dataKeyVoterCount = contract.methods.voterCount.cacheCall();
    const dataKeyOrganizerCount = contract.methods.organizerCount.cacheCall();
    const dataKeyPubKeyE = contract.methods.pubKeyE.cacheCall();
    const dataKeyPubKeyN = contract.methods.pubKeyN.cacheCall();
    this.setState({
      dataKeyVoterCount,
      dataKeyOrganizerCount,
      dataKeyPubKeyE,
      dataKeyPubKeyN
    });
  }

  componentDidUpdate() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const {VotingContract} = this.props.drizzleState.contracts;

    const voterCount = VotingContract.voterCount[this.state.dataKeyVoterCount];
    let dataKeyVoterAddresses = [];
    if (this.state.dataKeyVoterAddresses && parseInt(voterCount.value) !== this.state.dataKeyVoterAddresses.length) {
      // There is a change in voterCount, reset dataKeys
      this.setState({
        dataKeyVoters: null,
        dataKeyVoterAddresses: null,
        voters: null
      })
    }
    else if (voterCount && this.state.dataKeyVoterAddresses == null) {
      for (let i = 0; i < voterCount.value; i++) {
        dataKeyVoterAddresses.push(contract.methods.voterAddresses.cacheCall(i));
      }
      this.setState({ dataKeyVoterAddresses: dataKeyVoterAddresses });
    }
    else if (this.state.dataKeyVoterAddresses && this.state.dataKeyVoters == null && VotingContract.voterAddresses[this.state.dataKeyVoterAddresses[this.state.dataKeyVoterAddresses.length-1]]) {
      // Only do this if all dataKeyVoterAddresses are already loaded
      let dataKeyVoters = [];
      for (const dataKeyVoterAddress of this.state.dataKeyVoterAddresses) {
        const voterAddress = VotingContract.voterAddresses[dataKeyVoterAddress];
        dataKeyVoters.push(contract.methods.voters.cacheCall(voterAddress.value));
      }

      this.setState({ dataKeyVoters: dataKeyVoters });
    }
    else if (this.state.dataKeyVoters && this.state.voters == null && VotingContract.voters[this.state.dataKeyVoters[this.state.dataKeyVoters.length-1]]) {
      // Only do this if all dataKeyVoters are already loaded
      let voters = [];
      for (let i = 0; i < this.state.dataKeyVoters.length; i++) {
        const dataKeyVoter = this.state.dataKeyVoters[i];
        const voter = VotingContract.voters[dataKeyVoter];

        // Create voter object
        voters.push({
          address: voter.args[0],
          name: voter.value.name,
          blinded: voter.value.blinded,
          signed: voter.value.signed,
          organizerAddress: voter.value.signer
        })
      }

      this.setState({ voters: voters });
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

  isAccountRegistered = (address) => {
    if (!this.state.voters) {
      return false;
    }
    const voter = this.state.voters.find(voter => voter.address === address);
    // Only allow account to vote if it's not registered
    return !(voter === undefined);
  }

  getCurrentVoterAccount = () => {
    const {drizzleState} = this.props;
    return drizzleState.accounts[0];
  }

  handleSelectedAccount = (selectedAccount) => {
    this.setState({
      selectedAccount: selectedAccount
    })
  }

  getUnblindedVote = (voter, randomValue) => {
    const organizerSigner = this.state.organizers.find(organizer => organizer.address === voter.organizerAddress);
    const unblinded = BlindSignature.unblind({
      signed: voter.signed,
      N: organizerSigner.blindSigKey.N,
      r: randomValue
    });
    console.log("Unblinded vote : " + unblinded);
    return unblinded;
  }

  handleCastVote = (voterAddress, voteString, randomValue) => {
    const voter = this.state.voters.find(voter => voter.address === voterAddress);
    const unblinded = this.getUnblindedVote(voter, randomValue);

    // Verify if signature is correct before casting vote
    const organizerSigner = this.state.organizers.find(organizer => organizer.address === voter.organizerAddress);
    const isSignatureCorrect = BlindSignature.verify({
      unblinded: unblinded,
      N: organizerSigner.blindSigKey.N,
      E: organizerSigner.blindSigKey.E,
      message: Utils.soliditySha3(voteString)
    });
    console.log(voter);
    console.log(unblinded.toString());
    console.log(organizerSigner);
    console.log("Is Signature Correct : " + isSignatureCorrect);

    if (isSignatureCorrect) {
      // Get encryption key
      const {VotingContract} = this.props.drizzleState.contracts;
      const pubKeyE = VotingContract.pubKeyE[this.state.dataKeyPubKeyE];
      const pubKeyN = VotingContract.pubKeyN[this.state.dataKeyPubKeyN];
      // Encrypt using given encryption key
      const bigIntVoteString = new BigInteger(voteString.toString());
      const bigIntUnblinded = new BigInteger(unblinded.toString());
      const E = new BigInteger(pubKeyE.toString());
      const N = new BigInteger(pubKeyN.toString());
      const encryptedVoteString = bigIntVoteString.modPow(E, N);
      const encryptedUnblinded = bigIntUnblinded.modPow(E, N);
      console.log("Encryption key : ", E.toString(), N.toString());
      console.log("Encrypted vote string : ", encryptedVoteString.toString());
      console.log("Encrypted unblinded : ", encryptedUnblinded.toString());
      // Send vote
      this.sendVote(encryptedVoteString.toString(), encryptedUnblinded.toString(), voter.organizerAddress);
    }
    else {
      // Handle signature error
      console.log("Please contact the organizer");
    }
  }

  sendVote = (encryptedVoteString, encryptedUnblinded, signer) => {
    const {drizzle, drizzleState} = this.props;
    const contract = drizzle.contracts.VotingContract;

    const stackId = contract.methods.vote.cacheSend(
      encryptedVoteString,
      encryptedUnblinded,
      signer,
      { from: drizzleState.accounts[0] }
    );
    this.setState({
      stackIdVote: stackId
    });
  }

  render() {
    return (
      <div>
        <BallotSignedInfo voters={this.state.voters ? this.state.voters : []} voterAccount={this.getCurrentVoterAccount()} />
        <CastVote isAccountRegistered={this.isAccountRegistered} handleCastVote={this.handleCastVote} drizzleState={this.props.drizzleState} />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdVote} />
      </div>
    );
  }
}

export default VoteCastingVoter;