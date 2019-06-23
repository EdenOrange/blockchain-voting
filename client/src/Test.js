

import React, { Component, useState } from "react";
import { Button, Input } from 'semantic-ui-react';
import * as Utils from 'web3-utils';
import * as BlindSignature from './rsablind.js';
import { BigInteger } from 'jsbn';

function TestBlindSig(props) {
  
  const Bob = {
    key: BlindSignature.keyGeneration({ b: 256 }), // b: key-length
    // key: {
    //   keyPair: {
    //     n: new BigInteger('66655563862723763847474202717193239571546330570097639914700288437768035973357'),
    //     e: new BigInteger('65537'),
    //     d: new BigInteger('30604583246001812379790747729726135952696077026829347973823241423072305883521')
    //   }
    // },
    blinded: null,
    unblinded: null,
    message: null,
  };
  
  console.log('N: ', Bob.key.keyPair.n.toString());
  console.log('E: ', Bob.key.keyPair.e.toString());
  console.log('D: ', Bob.key.keyPair.d.toString());
  
  const randomMessage = Utils.randomHex(32);

  const Alice = {
    // message: '0x0038a785f2264892310aefbf35d7fffb38f41fd1d3ef60c710b5371d52000539',
    message: randomMessage,
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
    message: Alice.message.toString(),
    N: Alice.N.toString(),
    E: Alice.E.toString(),
  }); // Alice blinds message
  // Alice.r = r;
  Alice.r = r.toString();
  
  // Alice sends blinded to Bob
  Bob.blinded = blinded.toString();
  
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
    signed: Alice.signed.toString(),
    N: Alice.N.toString(),
    r: Alice.r.toString(),
  }); // Alice unblinds
  Alice.unblinded = unblinded;
  
  // Alice verifies
  const result = BlindSignature.verify({
    unblinded: Alice.unblinded.toString(),
    N: Alice.N.toString(),
    E: Alice.E.toString(),
    message: Alice.message,
  });
  if (result) {
    console.log('Alice: Signatures verify!');
  } else {
    console.log('Alice: Invalid signature', Alice.N.toString());
  }
  
  // Alice sends Bob unblinded signature and original message
  Bob.unblinded = Alice.unblinded.toString();
  Bob.message = Alice.message.toString();
  
  // Bob verifies
  const result2 = BlindSignature.verify2({
    unblinded: Bob.unblinded.toString(),
    // key: Bob.key,
    key: {
      keyPair: {
        e: new BigInteger(Bob.key.keyPair.e.toString()),
        n: new BigInteger(Bob.key.keyPair.n.toString()),
        d: new BigInteger(Bob.key.keyPair.d.toString()) // privateKey.toString()
      }
    },
    // message: Bob.message.toString(),
    message: Bob.message.toString(),
  });
  if (result2) {
    console.log('Bob: Signatures verify!');
  } else {
    console.log('Bob: Invalid signature');
  }
/*
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

    const testUnblinded = BlindSignature.unblind({
      signed: signed,
      N: N,
      r: r
    });

    const testVerify = BlindSignature.verify({
      unblinded: unblinded,
      N: N,
      E: E,
      message: voteString
    });

    console.log("Test 1 (Individual phases test)");
    console.log(testBlinded.toString() === blinded.toString(), testBlinded.toString(), blinded.toString());
    console.log("r", testR.toString(), r);
    console.log(testSigned.toString() === signed.toString(), testSigned.toString(), signed.toString());
    console.log(testUnblinded.toString() === unblinded.toString(), testUnblinded.toString(), unblinded.toString());
    console.log(testVerify);

    const test2 = BlindSignature.testBlind({
      message: voteString,
      N: new BigInteger(N),
      E: new BigInteger(E),
      r: r
    });
    const test2Blinded = test2.testBlinded;
    const test2R = test2.testR;
    const test2Signed = BlindSignature.sign({
      blinded: test2Blinded,
      key: {
        keyPair: {
          e: new BigInteger(E),
          n: new BigInteger(N),
          d: new BigInteger(D)
        }
      }
    });
    const test2Unblinded = BlindSignature.unblind({
      signed: test2Signed,
      N: N,
      r: test2R
    });
    const test2Verify = BlindSignature.verify({
      unblinded: test2Unblinded,
      N: N,
      E: E,
      message: voteString
    });
    console.log("Test 2 (No converting)");
    console.log("Blinded", test2Blinded.toString());
    console.log("Random value", test2R.toString());
    console.log("Signed", test2Signed.toString());
    console.log("Unblinded", test2Unblinded.toString());
    console.log("Verify", test2Verify);
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