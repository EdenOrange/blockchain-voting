# Blockchain Voting

## Description
An implementation of a voting system based on blockchain. A voting simulation has been done on [Rinkeby testnet][testnet-simulation]. The protocol used is based on [this paper][protocol].

This voting system aims to fulfill 3 aspects:
  * Transparency : Public verifiability of the voting system, which includes the data and its processes as well
  * Fairness : A voter should not be able to do partial tally, as it may influence his/her vote
  * Privacy-preserving : A vote that was sent should not be able to be tracked back to its voter
### Transparency
  Achieved using [Ethereum][ethereum] smart contract.
  
  This voting system runs on an Ethereum smart contract which gives public verifiability for its stored data and the transactions that interact with it. The smart contract contains all the logic that is needed to run the whole voting process, including counting the collected votes itself.
### Fairness
  Achieved using commit-reveal scheme.
  
  The vote will be encrypted before it is sent using a public key provided by an organizer. It will later be decrypted using a private key provided by an organizer after the voting phase ends.
  
### Privacy-preserving
  Achieved using [blind signature scheme][blind-signature].
  
  This voting system uses blind RSA signatures to provide unlinkability between a voter and his/her vote. This is used to preserve voter's privacy for his/her vote.

[testnet-simulation]: https://bit.ly/blockchain-voting
[ethereum]: https://en.wikipedia.org/wiki/Ethereum
[blind-signature]: https://en.wikipedia.org/wiki/Blind_signature
[protocol]: https://eprint.iacr.org/2017/1043.pdf