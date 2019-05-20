import React, { Component, useState } from "react";
import { Button, Divider, Dropdown, Header, Input } from 'semantic-ui-react';
import * as BlindSignature from 'blind-signatures';

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
      <Input
        fluid
        placeholder='Vote string...'
        onChange={(e) => setVoteString(e.target.value)}
      />
      <Input
        fluid
        placeholder='Random value...'
        onChange={(e) => setRandomValue(e.target.value)}
      />
      <Button primary onClick={() => handleCastVote(voteString, randomValue)}>
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
            blinded: '106380571',
            signed: '50914715',
            organizerSignerId: '3'
          },
          {
            address: '0xAddress002',
            blinded: '106380571',
            signed: '140035364',
            organizerSignerId: '2'
          },
          {
            address: '0xAddress003',
            blinded: '106380571',
            signed: '44060348',
            organizerSignerId: '3'
          },
          {
            address: '0xAddress004',
            blinded: '106380571',
            signed: '87594437',
            organizerSignerId: '2'
          },
          {
            address: '0xAddress005',
            blinded: '106380571',
            signed: '188234335',
            organizerSignerId: '1'
          },
          {
            address: '0xAddress006',
            blinded: '106380571',
            signed: '116462440',
            organizerSignerId: '1'
          }
        ],
        organizers: [ // Organizer account
          {
            id: '1',
            address: '0xAddressOrg001',
            name: 'Org1',
            blindSigKey: { // RSA keypair
              N: 29966692371364866625346898353663834134938385542002417037721577477302102136522085939472165345604159090008369291967229214089843550402783764345171829774118370421727069328975236719404868237298550523989366936116144150572205603225580613276301181810980227503747111091217434069794434110873713548193276565135873156551776781744977506384102252699464204349946745613824014413457618301726927010747822355674379832350188825717228418277968661184894099448068813151646552494933847934355517511397146924721973857101644904751900691439081133481472498369847582949341542277140564618444421223545987899994237990578140719418027385682765400810787,
              E: 65537
            }
          },
          {
            id: '2',
            address: '0xAddressOrg002',
            name: 'Org2',
            blindSigKey: {
              N: 26458970144176529231278251478923876274581682945160630211923288556492285074551812817562954732957996890856225708775063710963505080257659492810452589951505161037289950403780584424848427034382647213927966088689259773969220432507351297342517879366775210437071365276681805376039406952355809450845271748916810754673242718443536347275958685398465694101786361797986578701119612608844428824062586235437039817380062355856918189315480847660878662520951404772466376423110443487482138333887388449385867806705579043254110057834686860727136742974754338482731437361733622421487674030607511342064989032215407906503194121394165185383797,
              E: 65537
            }
          },
          {
            id: '3',
            address: '0xAddressOrg003',
            name: 'Org3',
            blindSigKey: {
              N: 22174933060533612279001839757293277558447636625990692079946257223347032594943597488661968989040186738935132503446965285010055923873177882577484769463195499109178479501165613614043668876610322147551149096608999387482124244500100367766728152174625193206582596173771525689770346002747421347904671941536291573608005763407437768868993893358554277826661660885093146948296152543868273304544471129280791068975551329074059044323118982282750362281455605896422650475741100638391510715626109674650392999767613861555822958045214362249243277613528444450124436766949894713659037566339120415451310965138637574175225632109970533494113,
              E: 65537
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
        },
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

    // Send cast vote to VotingContract
    // IMPORTANT : Send using selectedAccount(anonymous), not voterAccount(registered)
    const message = {
      voteString: voteString,
      unblinded: unblinded.toString(),
      organizerId: voter.organizerSignerId
    }
    console.log("Send : " + JSON.stringify(message));
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