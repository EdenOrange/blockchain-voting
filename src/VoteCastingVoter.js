import React, { Component } from "react";
import { Divider, Dropdown, Header } from 'semantic-ui-react';

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
        Your Accounts
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
      selectedAccount: 0
    }
  }

  getCurrentVoterAccount = () => {
    return this.state.accounts[this.state.selectedAccount];
  }

  handleSelectedAccount = (selectedAccount) => {
    this.setState({
      selectedAccount: selectedAccount
    })
  }

  render() {
    return (
      <div>
        <BallotSignedInfo voters={this.state.votingContract.voters} voterAccount={this.getCurrentVoterAccount()} />
        <Divider />
        <AccountsList accounts={this.state.accounts} selectedAccount={this.state.selectedAccount} handleSelectedAccount={this.handleSelectedAccount} />
      </div>
    );
  }
}

export default VoteCastingVoter;