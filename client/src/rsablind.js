// rsablind.js
// Source : https://github.com/kevinejohn/blind-signatures
// With modification on messageToHash() to use soliditySha3 instead of sha-256

const secureRandom = require('secure-random');
const BigInteger = require('jsbn').BigInteger;
const NodeRSA = require('node-rsa');
const Utils = require('web3-utils');

function keyGeneration(params) {
  const key = new NodeRSA(params || { b: 256 });
  return key;
}

function keyProperties(key) {
  return {
    E: new BigInteger(key.keyPair.e.toString()),
    N: key.keyPair.n,
    D: key.keyPair.d,
  };
}

function messageToHash(message) {
  const messageHash = Utils.soliditySha3(message);
  return messageHash.substring(2, messageHash.length);
}

function messageToHashInt(message) {
  const messageHash = messageToHash(message);
  const messageBig = new BigInteger(messageHash, 16);
  return messageBig;
}

function blind({ message, key, N, E }) {
  const messageHash = messageToHashInt(message);
  N = key ? key.keyPair.n : new BigInteger(N.toString());
  E = key
    ? new BigInteger(key.keyPair.e.toString())
    : new BigInteger(E.toString());

  const bigOne = new BigInteger('1');
  let gcd;
  let r;
  do {
    r = new BigInteger(secureRandom(64)).mod(N);
    gcd = r.gcd(N);
  } while (
    !gcd.equals(bigOne) ||
    r.compareTo(N) >= 0 ||
    r.compareTo(bigOne) <= 0
  );
  const blinded = messageHash.multiply(r.modPow(E, N)).mod(N);
  console.log("returning", blinded.toString(), r.toString());
  return {
    blinded,
    r,
  };
}

function testBlind({ message, key, N, E, r }) {
  const messageHash = messageToHashInt(message);
  N = key ? key.keyPair.n : new BigInteger(N.toString());
  E = key
    ? new BigInteger(key.keyPair.e.toString())
    : new BigInteger(E.toString());

  const testR = new BigInteger(r.toString());
  const testBlinded = messageHash.multiply(testR.modPow(E, N)).mod(N);
  return {
    testBlinded,
    testR
  };
}

function sign({ blinded, key }) {
  const { N, D } = keyProperties(key);
  blinded = new BigInteger(blinded.toString());
  const signed = blinded.modPow(D, N);
  return signed;
}

function unblind({ signed, key, r, N }) {
  r = new BigInteger(r.toString());
  N = key ? key.keyPair.n : new BigInteger(N.toString());
  signed = new BigInteger(signed.toString());
  const unblinded = signed.multiply(r.modInverse(N)).mod(N);
  return unblinded;
}

function verify({ unblinded, key, message, E, N }) {
  unblinded = new BigInteger(unblinded.toString());
  const messageHash = messageToHashInt(message);
  N = key ? key.keyPair.n : new BigInteger(N.toString());
  E = key
    ? new BigInteger(key.keyPair.e.toString())
    : new BigInteger(E.toString());

  const originalMsg = unblinded.modPow(E, N);
  const result = messageHash.equals(originalMsg);
  console.log("VERIFY");
  console.log("message", message);
  console.log("messageHash", messageHash.toString());
  console.log("originalMsg", originalMsg.toString());
  return result;
}

function verify2({ unblinded, key, message }) {
  unblinded = new BigInteger(unblinded.toString());
  const messageHash = messageToHashInt(message);
  const { D, N } = keyProperties(key);
  const msgSig = messageHash.modPow(D, N);
  const result = unblinded.equals(msgSig);
  return result;
}

module.exports = {
  keyGeneration,
  messageToHash,
  messageToHashInt,
  blind,
  testBlind,
  sign,
  unblind,
  verify,
  verify2,
};