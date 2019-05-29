

import React, { Component } from "react";
import * as BlindSignature from 'blind-signatures';

function TestBlindSig(props) {
  const Bob = {
    key: BlindSignature.keyGeneration({ b: 256 }), // b: key-length
    blinded: null,
    unblinded: null,
    message: null,
  };

  console.log(Bob.key.keyPair);
  console.log('N: ', Bob.key.keyPair.n.toString());
  console.log('E: ', Bob.key.keyPair.e.toString());
  console.log('D: ', Bob.key.keyPair.d.toString());
  
  const Alice = {
    message: 'Hello Chaum!',
    N: null,
    E: null,
    r: null,
    signed: null,
    unblinded: null,
  };
  
  // Alice wants Bob to sign a message without revealing it's contents.
  // Bob can later verify he did sign the message
  
  console.log('Message:', Alice.message);
  
  // Alice gets N and E variables from Bob's key
  Alice.N = Bob.key.keyPair.n.toString();
  Alice.E = Bob.key.keyPair.e.toString();
  
  const { blinded, r } = BlindSignature.blind({
    message: Alice.message,
    N: Alice.N,
    E: Alice.E,
  }); // Alice blinds message
  Alice.r = r;
  
  // Alice sends blinded to Bob
  Bob.blinded = blinded;
  
  const signed = BlindSignature.sign({
    blinded: Bob.blinded,
    key: Bob.key,
  }); // Bob signs blinded message
  
  // Bob sends signed to Alice
  Alice.signed = signed;
  
  const unblinded = BlindSignature.unblind({
    signed: Alice.signed,
    N: Alice.N,
    r: Alice.r,
  }); // Alice unblinds
  Alice.unblinded = unblinded;
  
  // Alice verifies
  const result = BlindSignature.verify({
    unblinded: Alice.unblinded,
    N: Alice.N,
    E: Alice.E,
    message: Alice.message,
  });
  if (result) {
    console.log('Alice: Signatures verify!');
  } else {
    console.log('Alice: Invalid signature');
  }
  
  // Alice sends Bob unblinded signature and original message
  Bob.unblinded = Alice.unblinded;
  Bob.message = Alice.message;
  
  // Bob verifies
  const result2 = BlindSignature.verify2({
    unblinded: Bob.unblinded,
    key: Bob.key,
    message: Bob.message,
  });
  if (result2) {
    console.log('Bob: Signatures verify!');
  } else {
    console.log('Bob: Invalid signature');
  }
  
  return (
    <div></div>
  );
}

class Test extends Component {
  render() {
    return (
      <div>
        Testing page
        <TestBlindSig />
      </div>
    );
  }
}

export default Test;