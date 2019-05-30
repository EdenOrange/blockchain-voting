import React, { Component, useState } from "react";
import { Button, Divider, Dropdown, Form, Header, Input, TextArea } from 'semantic-ui-react';
import * as Utils from 'web3-utils';
import * as BlindSignature from './rsablind.js';

function BallotSignedInfo(props) {
  const {voters, voterAccount} = props;
  const voter = voters.find(voter => voter.address === voterAccount.address);
  
  if (voter === undefined) {
    return (
      <div>
        <Header>
          This account is not registered in voting
        </Header>
      </div>
    )
  }
  else if (voter.signed === '') {
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
      </div>
    )
  }
}

function AccountsList(props) {
  const {accounts, selectedAccount, handleSelectedAccount} = props;
  const accountsList = accounts.map((account, index) => ({
    key: index,
    value: index,
    text: account.address
  }));

  return (
    <div>
      <Header>
        Select an account to cast vote from
      </Header>
      <Dropdown
        defaultValue={selectedAccount}
        fluid
        selection
        options={accountsList}
        onChange={(e, {value}) => handleSelectedAccount(value)}
      />
    </div>
  )
}

function CastVote(props) {
  const {handleCastVote} = props;
  const [voteString, setVoteString] = useState('');
  const [randomValue, setRandomValue] = useState('');

  return (
    <div>
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
      <Button primary disabled={voteString === '' || randomValue === ''} onClick={() => handleCastVote(voteString, randomValue)}>
        Cast Vote!
      </Button>
    </div>
  );
}

class VoteCastingVoter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votingContract: {
        voters: [
          {
            address: '0xAddress001',
            name: 'Name1',
            blinded: '17652845696649741417152511462776404372140482205064679192668900950337268753730',
            signed: '45792520612372430153329999946684124832522719481224633410526642036448009106865',
            organizerSignerId: '2'
          },
          {
            address: '0xAddress002',
            blinded: '37750636546558081962522384583041993839860020088555699626376854796142356515839',
            signed: '35567308158771474228979603120938149994425035910651915509590781878090188144135',
            organizerSignerId: '3'
          },
          {
            address: '0xAddress003',
            blinded: '30469603815817493807875000129541341432678290297266808979972427283420381282034',
            signed: '25308461979923292239175439568191573427090682163193441648577399241790083375833',
            organizerSignerId: '1'
          },
          {
            address: '0xAddress004',
            blinded: '34996292477880701805927129263415091920630509415027671905774620648566170305349',
            signed: '51329264295069997897955025239313989697877033535907283266315593960850545336865',
            organizerSignerId: '1'
          },
          {
            address: '0xAddress005',
            blinded: '27844615070844257491998880898393610979157395483180153717177165365073524479138',
            signed: '59332976150495495034205625478082738719976322181890094820235788008813257869893',
            organizerSignerId: '3'
          },
          {
            address: '0xAddress006',
            blinded: '955239002786347003674711759228335528752480761282941507602889871959791655984',
            signed: '43575882499286586383261273537472795126604734513969620380699759739814221075154',
            organizerSignerId: '2'
          }
        ],
        organizers: [ // Organizer account
          {
            id: '1',
            address: '0xAddressOrg001',
            name: 'Org1',
            blindSigKey: { // RSA keypair
              N: '78308813544601119203537647274085596537008054539298091635048937059441638602911',
              E: '65537'
            }
          },
          {
            id: '2',
            address: '0xAddressOrg002',
            name: 'Org2',
            blindSigKey: {
              N: '58697532336480146441198642100070341275175223310790866838056318326792138477057',
              E: '65537'
            }
          },
          {
            id: '3',
            address: '0xAddressOrg003',
            name: 'Org3',
            blindSigKey: {
              N: '67253331087594991077797839859018821584857482008345015897914384596160310638849',
              E: '65537'
            }
          }
        ]
      },
      accounts: [
        {
          address: '0xAddress001'
        },
        {
          address: '0xAddress002'
        },
        {
          address: '0xAddress003'
        },
        {
          address: '0xAddress004'
        },
        {
          address: '0xAddress005'
        },
        {
          address: '0xAddress006'
        },
        {
          address: '0xAddress101'
        },
        {
          address: '0xAddress102'
        },
        {
          address: '0xAddress103'
        },
        {
          address: '0xAddress104'
        },
        {
          address: '0xAddress105'
        },
        {
          address: '0xAddress106'
        }
      ],
      voterAccount: 5, // Selected wallet account
      selectedAccount: 0 // Another account to be cast vote anonymously
    }
  }

  getCurrentVoterAccount = () => {
    return this.state.accounts[this.state.voterAccount];
  }

  handleSelectedAccount = (selectedAccount) => {
    this.setState({
      selectedAccount: selectedAccount
    })
  }

  getUnblindedVote = (voter, randomValue) => {
    const organizerSigner = this.state.votingContract.organizers.find(organizer => organizer.id === voter.organizerSignerId);
    const unblinded = BlindSignature.unblind({
      signed: voter.signed,
      N: organizerSigner.blindSigKey.N,
      r: randomValue
    });
    console.log("Unblinded vote : " + unblinded);
    return unblinded;
  }

  handleCastVote = (voteString, randomValue) => {
    const voter = this.state.votingContract.voters.find(voter => voter.address === this.state.accounts[this.state.voterAccount].address);
    const unblinded = this.getUnblindedVote(voter, randomValue);

    // Verify if signature is correct before casting vote
    const organizerSigner = this.state.votingContract.organizers.find(organizer => organizer.id === voter.organizerSignerId);
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
      // Send cast vote to VotingContract
      // IMPORTANT : Send using selectedAccount(anonymous), not voterAccount(registered)
      const message = {
        voteString: voteString,
        unblinded: unblinded.toString(),
        organizerId: voter.organizerSignerId
      }
      console.log("Send : " + JSON.stringify(message));
    }
    else {
      // Handle signature error
      console.log("Please contact the organizer");
    }
  }

  render() {
    return (
      <div>
        <BallotSignedInfo voters={this.state.votingContract.voters} voterAccount={this.getCurrentVoterAccount()} />
        <Divider />
        <AccountsList accounts={this.state.accounts} selectedAccount={this.state.selectedAccount} handleSelectedAccount={this.handleSelectedAccount} />
        <CastVote handleCastVote={this.handleCastVote} />
      </div>
    );
  }
}

export default VoteCastingVoter;