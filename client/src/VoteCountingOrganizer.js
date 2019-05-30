import React, { Component } from "react";
import { Button, Divider, Header, List } from 'semantic-ui-react';
import * as Utils from 'web3-utils';
import * as BlindSignature from './rsablind.js';

function EndVotingInfo(props) {
  const {endVotingTime, status} = props;

  if (status === 'Voting') {
    return (
      <div>
        <Header>
          Voting is in progress
        </Header>
        <Header>
          Voting may be ended at : {new Date(endVotingTime*1000).toString()}
        </Header>
      </div>
    );
  }
  else if (status === 'Finished') {
    return (
      <div>
        <Header>
          Voting has finished
        </Header>
      </div>
    );
  }
  else { // Preparation/Registration
    return (
      <div>
        <Header>
          Voting has not started yet
        </Header>
      </div>
    );
  }
}

function StartTally(props) {
  const {endVotingTime, startTallyCallback} = props;
  const currentBlockTimestamp = getCurrentBlockTimestamp();

  if (currentBlockTimestamp >= endVotingTime*1000) {
    return (
      <div>
        <Button primary onClick={startTallyCallback}>
          Start Tally
        </Button>
      </div>
    );
  }
}

function TallyResult(props) {
  const {tallyResult, candidates} = props;
  tallyResult.sort((a, b) => a.votes > b.votes ? -1 : 1); // Sort result by votes descending
  const TallyResult = tallyResult.map((candidateResult) => {
    const candidate = candidates.find(candidate => candidate.id === candidateResult.id);
    const candidateName = candidate.name;
    const candidateVotes = candidateResult.votes;
    return CandidateResult(candidateName, candidateVotes);
  });

  return (
    <List divided>
      {TallyResult}
    </List>
  );
}

function CandidateResult(candidateName, candidateVotes) {
  return (
    <List.Item key={candidateName}>
      <List.Content>
        <List.Header>
          {candidateName}
        </List.Header>
        <List.Description>
          Votes : {candidateVotes}
        </List.Description>
      </List.Content>
    </List.Item>
  );
}

function getCurrentBlockTimestamp() {
  // Get most recent block timestamp
  // return web3.eth.getBlock(web3.eth.blockNumber).timestamp * 1000; // JS timestamp is in milliseconds
  return Date.now();
}

function tally(votes, organizers) {
  // Tallying will be done in VotingContract
  // This client-side tally is for testing
  // Will call tally() function on VotingContract instead
  // Might need to do tally() in batches for VotingContract, for large amount of votes to avoid block gas limit

  let organizerMap = {};
  for (const organizer of organizers) {
    organizerMap[organizer.id] = {
      N: organizer.blindSigKey.N,
      E: organizer.blindSigKey.E
    };
  }

  let candidateVotes = {};
  for (const vote of votes) {
    const organizer = organizerMap[vote.organizerId];
    const isSignatureCorrect = BlindSignature.verify({
      unblinded: vote.unblinded,
      N: organizer.N,
      E: organizer.E,
      message: Utils.soliditySha3(vote.voteString)
    });

    if (isSignatureCorrect) {
      const candidateId = getCandidateIdFromVoteString(vote.voteString);
      if (candidateVotes[candidateId] === undefined) {
        candidateVotes[candidateId] = 1;
      }
      else {
        candidateVotes[candidateId] += 1;
      }
    }
  }

  let tallyResult = [];
  for (const candidateVote in candidateVotes) {
    tallyResult.push({
      id: candidateVote,
      votes: candidateVotes[candidateVote]
    });
  }

  return tallyResult;
}



function getCandidateIdFromVoteString(voteString) {
  const candidateIdLength = 4;
  const candidateIdBit = voteString.substr(0, candidateIdLength);
  const candidateId = parseInt(candidateIdBit, 2);
  return candidateId;
}

class VoteCountingOrganizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votingContract: {
        voters: [
          {
            address: '0xAddress001',
            name: 'Name1',
            blinded: '17652845696649741417152511462776404372140482205064679192668900950337268753730',
            signed: '45792520612372430153329999946684124832522719481224633410526642036448009106865',
            organizerSignerId: '2'
          },
          {
            address: '0xAddress002',
            blinded: '37750636546558081962522384583041993839860020088555699626376854796142356515839',
            signed: '35567308158771474228979603120938149994425035910651915509590781878090188144135',
            organizerSignerId: '3'
          },
          {
            address: '0xAddress003',
            blinded: '30469603815817493807875000129541341432678290297266808979972427283420381282034',
            signed: '25308461979923292239175439568191573427090682163193441648577399241790083375833',
            organizerSignerId: '1'
          },
          {
            address: '0xAddress004',
            blinded: '34996292477880701805927129263415091920630509415027671905774620648566170305349',
            signed: '51329264295069997897955025239313989697877033535907283266315593960850545336865',
            organizerSignerId: '1'
          },
          {
            address: '0xAddress005',
            blinded: '27844615070844257491998880898393610979157395483180153717177165365073524479138',
            signed: '59332976150495495034205625478082738719976322181890094820235788008813257869893',
            organizerSignerId: '3'
          }
        ],
        organizers: [ // Organizer account
          {
            id: '1',
            address: '0xAddressOrg001',
            name: 'Org1',
            blindSigKey: { // RSA keypair
              N: '78308813544601119203537647274085596537008054539298091635048937059441638602911',
              E: '65537'
            }
          },
          {
            id: '2',
            address: '0xAddressOrg002',
            name: 'Org2',
            blindSigKey: {
              N: '58697532336480146441198642100070341275175223310790866838056318326792138477057',
              E: '65537'
            }
          },
          {
            id: '3',
            address: '0xAddressOrg003',
            name: 'Org3',
            blindSigKey: {
              N: '67253331087594991077797839859018821584857482008345015897914384596160310638849',
              E: '65537'
            }
          }
        ],
        votes: [
          {
            voteString: '0001001100111011111000101100011011011000001111100011000000011011',
            unblinded: '16950908298736504282015652212157057569964666499676072228524184706761619085500',
            organizerId: '2'
          },
          {
            voteString: '0010110111000001101000111101010100111010101011010100101011000110',
            unblinded: '28063673950960544066016738653645920508859138176084767335304793616256734727313',
            organizerId: '3'
          },
          {
            voteString: '0001101001110001100110101000001000000100000111001100101101010001',
            unblinded: '72679506291397088521752359471902892852691044679455079436218477650687595310890',
            organizerId: '1'
          },
          {
            voteString: '0010010110110011011100010100101011000100100001000011111111110001',
            unblinded: '63091094621260373561524683893604641649195941193310759185490596832329856989536',
            organizerId: '1'
          },
          {
            voteString: '0001000101010011100001100000010110101011100101001000001010011000',
            unblinded: '17239967092992778067840773664840247141215083046166636364247045986349287854899',
            organizerId: '3'
          }
        ],
        candidates: [
          {
            id: '1',
            name: 'Candidate1'
          },
          {
            id: '2',
            name: 'Candidate2'
          }
        ],
        endVotingTime: 1558483200, // Eth block.timestamp (Unix timestamp)
        status: 'Voting'
      },
      tallyResult: {}
    }
  }

  handleStartTally = () => {
    const startTallyTime = Date.now();
    console.log("Starting tally : " + startTallyTime);
    // tally(this.state.votingContract.votes, this.state.votingContract.organizers); // Call tally() function in VotingContract
    const tallyResult = tally(this.state.votingContract.votes, this.state.votingContract.organizers); // Client-side tally() function for testing
    const endTallyTime = Date.now();
    console.log("Tally ended : " + endTallyTime);
    this.setState( prevState => ({
      votingContract: {
        ...prevState.votingContract,
        status: 'Finished'
      },
      tallyResult: tallyResult
    }));
  }

  render() {
    return (
      <div>
        <EndVotingInfo endVotingTime={this.state.votingContract.endVotingTime} status={this.state.votingContract.status} />
        <Divider />
        {this.state.votingContract.status === 'Voting' && 
          <StartTally
            endVotingTime={this.state.votingContract.endVotingTime}
            startTallyCallback={this.handleStartTally}  
          />
        }
        {this.state.votingContract.status === 'Finished' && 
          <TallyResult tallyResult={this.state.tallyResult} candidates={this.state.votingContract.candidates} />
        }
      </div>
    );
  }
}

export default VoteCountingOrganizer;