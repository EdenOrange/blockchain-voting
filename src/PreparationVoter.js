import React, { Component } from "react";
import { Icon, List } from 'semantic-ui-react';

function ShowAccountInfoList(props) {
  const {accounts} = props;
  const Accounts = accounts.map((account) => ShowAccountInfo(account));

  return (
    <List divided>
      {Accounts}
    </List>
  );
}

function ShowAccountInfo(account) {
  return (
    <List.Item key={account.address}>
      {account.address}
      <List.List>
        <List.Item>
          Registered : {account.registered ? <Icon name='check' /> : <Icon name='close' />}
        </List.Item>
        {account.registered && 
        <List.Item>
          Blinded Vote : {account.blindedVote}
        </List.Item>
        }
        {account.registered && 
        <List.Item>
          Signed Blinded Vote : {account.signedBlindedVote}
        </List.Item>
        }
      </List.List>
    </List.Item>
  );
}

class PreparationVoter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [
        {
          address: '0xAddress001',
          registered: true,
          blindedVote: 'blindedVote001',
          signedBlindedVote: 'signedBlindedVote001'
        },
        {
          address: '0xAddress002',
          registered: false,
        },
        {
          address: '0xAddress003',
          registered: true,
          blindedVote: 'blindedVote003',
          signedBlindedVote: 'signedBlindedVote003'
        }
      ]
    }
  }

  render() {
    return (
      <div>
        <ShowAccountInfoList accounts={this.state.accounts} />
      </div>
    );
  }
}

export default PreparationVoter;