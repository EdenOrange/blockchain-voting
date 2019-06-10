

import React, { Component } from "react";
import { Button, Divider } from 'semantic-ui-react';
import * as BlindSignature from './rsablind.js';

class RSAGenerator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      N: '',
      E: '',
      D: '',
      showPrivateKey: false
    }
  }

  generateNewKeyPair = () => {
    const keyPair = BlindSignature.keyGeneration({ b: 256 });
    this.setState({
      N: keyPair.keyPair.n.toString(),
      E: keyPair.keyPair.e.toString(),
      D: keyPair.keyPair.d.toString()
    })
  }

  render() {
    return (
      <div>
        N: {this.state.N}
        <br />
        E: {this.state.E}
        <br />
        D: {this.state.showPrivateKey ? this.state.D : 'Private key hidden'}
        <br />
        <Button
          primary
          onClick={() => this.setState({ showPrivateKey: !this.state.showPrivateKey })}
        >
          Toggle show private key
        </Button>
        <Divider />
        <Button
          primary
          onClick={() => this.generateNewKeyPair()}
        >
          Generate new key pair
        </Button>
      </div>
    );
  }
}

export default RSAGenerator;