

import React, { Component, useState } from "react";
import { Button, Input } from 'semantic-ui-react';
import { BigInteger } from 'jsbn'; 
import * as Utils from 'web3-utils';
import * as BlindSignature from './rsablind.js';

function messageToHash(message) {
  const messageHash = Utils.soliditySha3(message);
  return messageHash.substring(2, messageHash.length);
}

function messageToHashInt(message) {
  const messageHash = messageToHash(message);
  console.log("messageToHashInt", messageHash.toString());
  const messageBig = new BigInteger(messageHash, 16);
  console.log("messageBig", messageBig.toString());
  return messageBig;
}

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
  // Alice.r = r;
  Alice.r = r.toString();
  
  // Alice sends blinded to Bob
  Bob.blinded = blinded;
  
  const signed = BlindSignature.sign({
    // blinded: Bob.blinded.toString(),
    // key: Bob.key,
    blinded: blinded.toString(),
    key: {
      keyPair: {
        e: new BigInteger(Bob.key.keyPair.e.toString()),
        n: new BigInteger(Bob.key.keyPair.n.toString()),
        d: new BigInteger(Bob.key.keyPair.d.toString()) // privateKey.toString()
      }
    }
  }); // Bob signs blinded message
  
  // Bob sends signed to Alice
  // Alice.signed = signed;
  Alice.signed = signed.toString();
  
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

  const testUnblinded = "18431452880217904135031932785117497248237962884253514036659836759180181730598";
  const testE = new BigInteger("65537");
  const testN = new BigInteger("58697532336480146441198642100070341275175223310790866838056318326792138477057");
  const message = Utils.soliditySha3({
    type: "bytes32",
    value: "0x02d2acbe4891f6f0de2484eeec32d8151398f1fca7162ed1727f499302afc87f"
  });
  console.log(message);
  const verifyUnblinded = new BigInteger(testUnblinded);
  const originalMessage = verifyUnblinded.modPow(testE, testN);
  const messageHash = messageToHashInt(message);
  console.log("messageHash", messageHash.toString());
  console.log("originalMessage", originalMessage.toString());
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

function BlindSig(props) {
  const [voteString, setVoteString] = useState('');
  const [blinded, setBlinded] = useState('');
  const [N, setN] = useState('');
  const [E, setE] = useState('');
  const [D, setD] = useState('');
  const [r, setR] = useState('');
  const [signed, setSigned] = useState('');
  const [unblinded, setUnblinded] = useState('');

  const onClick = () => {
    const { testBlinded, testR } = BlindSignature.testBlind({
      message: voteString,
      N: new BigInteger(N),
      E: new BigInteger(E),
      r: r
    });
    console.log(testBlinded.toString() === blinded, testBlinded.toString(), blinded);
    console.log("r", testR.toString(), r);

    const testSigned = BlindSignature.sign({
      blinded: blinded,
      key: {
        keyPair: {
          e: new BigInteger(E),
          n: new BigInteger(N),
          d: new BigInteger(D)
        }
      }
    });
    console.log(testSigned.toString() === signed, testSigned.toString(), signed);

    const testUnblinded = BlindSignature.unblind({
      signed: signed,
      N: N,
      r: r
    });
    console.log(testUnblinded.toString() === unblinded, testUnblinded.toString(), unblinded);

    const testVerify = BlindSignature.verify({
      unblinded: unblinded,
      N: N,
      E: E,
      message: voteString
    });
    console.log(testVerify);
  }

  return (
    <div>
      <Input
        placeholder='Vote string...'
        onChange={(e) => setVoteString(e.target.value)}
      />
      <Input
        placeholder='Blinded...'
        onChange={(e) => setBlinded(e.target.value)}
      />
      <Input
        placeholder='N...'
        onChange={(e) => setN(e.target.value)}
      />
      <Input
        placeholder='E...'
        onChange={(e) => setE(e.target.value)}
      />
      <Input
        placeholder='D...'
        onChange={(e) => setD(e.target.value)}
      />
      <Input
        placeholder='Random value...'
        onChange={(e) => setR(e.target.value)}
      />
      <Input
        placeholder='Signed...'
        onChange={(e) => setSigned(e.target.value)}
      />
      <Input
        placeholder='Unblinded...'
        onChange={(e) => setUnblinded(e.target.value)}
      />
      <Button
        primary
        onClick={() => onClick()}
      />
    </div>
  );
}

class Test extends Component {
  render() {
    return (
      <div>
        Testing page
        {/* <TestBlindSig /> */}
        <BlindSig />
      </div>
    );
  }
}

export default Test;