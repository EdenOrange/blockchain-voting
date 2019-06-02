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
            blinded: '60426752463516873348926488754445044242595969058904053657514082843526071481527',
            signed: '76815247291987702809329430016440520290348748523617982221786994675505864771817',
            organizerSignerId: '2'
          },
          {
            address: '0xAddress002',
            blinded: '2567123009865940580716339588244153997372504321992020692242420551839608271491',
            signed: '40475393562802698418956301273911487135011690134550800805109750610319574995399',
            organizerSignerId: '3'
          },
          {
            address: '0xAddress003',
            blinded: '71718673910107162727424259620988374895193573839558412358249900876057432719869',
            signed: '46688078332120474924105756899278368575502504013209392081942692426667400001502',
            organizerSignerId: '1'
          },
          {
            address: '0xAddress004',
            blinded: '62914212792489438301203135771726128897949536759588274508724916053533957197919',
            signed: '67367023678296148522332179618119911418780824786864936805093780738986830987986',
            organizerSignerId: '3'
          },
          {
            address: '0xAddress005',
            blinded: '14931406149964567040796113903350886229955003902462973945590388207327926513582',
            signed: '42798761570759785510353313481211507910639282983313031446259167970300318638564',
            organizerSignerId: '1'
          }
        ],
        organizers: [ // Organizer account
          {
            id: '1',
            address: '0xAddressOrg001',
            name: 'Org1',
            blindSigKey: { // RSA keypair
              N: '76371029918972468664941514738317813949700823831516674062130698696256739747471',
              E: '65537'
            }
          },
          {
            id: '2',
            address: '0xAddressOrg002',
            name: 'Org2',
            blindSigKey: {
              N: '84363999601518293055825661401325254763629655239082503904477611930728364455689',
              E: '65537'
            }
          },
          {
            id: '3',
            address: '0xAddressOrg003',
            name: 'Org3',
            blindSigKey: {
              N: '67478541602739783545562006148578430599142391044897235744290252182816844486133',
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
        }
      ],
      voterAccount: 3, // Selected wallet account
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