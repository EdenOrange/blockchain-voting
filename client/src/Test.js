

import React, { Component } from "react";
import * as BlindSignature from 'blind-signatures';
import { BigInteger } from 'jsbn'; 
import * as Utils from 'web3-utils';

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
/*
  const N = "58697532336480146441198642100070341275175223310790866838056318326792138477057";
  const E = "65537";
  const D = "37675975330979047563902254887797106612462090157231312369036798725649986371681";
  const message = "0001100111100101000000010011110111101010111010001010101010111001";
  const blinded = "57221009685133276489649705549076310014986508973798112634818796638756103361497";
  const r = "27240930816601627203297284412645621648385440502424254114327376784127253912143";
  const signed = "47320511526484480672545493132411311208752604313027294693269009320216331277974";
  const unblind = "54002179463205042116184388761924275590714680341223191814795145717257416398460";

  const key = {
    keyPair: {
      n: new BigInteger(N),
      e: new BigInteger(E),
      d: new BigInteger(D)
    }
  }

  const trueSigned = BlindSignature.sign({
    blinded: blinded,
    key: key
  });
  console.log(signed.toString());
  console.log(trueSigned.toString());
  console.log(signed.toString() === trueSigned.toString());

  const trueUnblind = BlindSignature.unblind({
    signed: signed,
    N: N,
    r: r
  });
  console.log(unblind.toString());
  console.log(trueUnblind.toString());
  console.log(unblind.toString() === trueUnblind.toString());
  
  const result = BlindSignature.verify({
    unblinded: unblind,
    N: N,
    E: E,
    message: Utils.soliditySha3(message),
  });
  if (result) {
    console.log('Signatures verify!');
  } else {
    console.log('Invalid signature');
  }
*/
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