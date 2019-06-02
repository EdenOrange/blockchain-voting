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
  const candidateIdByte = voteString.substr(2, 2);
  const candidateId = parseInt(candidateIdByte, 16);
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
            blinded: '60426752463516873348926488754445044242595969058904053657514082843526071481527',
            signed: '76815247291987702809329430016440520290348748523617982221786994675505864771817',
            organizerSignerId: '2'
          },
          {
            address: '0xAddress002',
            blinded: '2567123009865940580716339588244153997372504321992020692242420551839608271491',
            signed: '40475393562802698418956301273911487135011690134550800805109750610319574995399',
            organizerSignerId: '3'
          },
          {
            address: '0xAddress003',
            blinded: '71718673910107162727424259620988374895193573839558412358249900876057432719869',
            signed: '46688078332120474924105756899278368575502504013209392081942692426667400001502',
            organizerSignerId: '1'
          },
          {
            address: '0xAddress004',
            blinded: '62914212792489438301203135771726128897949536759588274508724916053533957197919',
            signed: '67367023678296148522332179618119911418780824786864936805093780738986830987986',
            organizerSignerId: '3'
          },
          {
            address: '0xAddress005',
            blinded: '14931406149964567040796113903350886229955003902462973945590388207327926513582',
            signed: '42798761570759785510353313481211507910639282983313031446259167970300318638564',
            organizerSignerId: '1'
          }
        ],
        organizers: [ // Organizer account
          {
            id: '1',
            address: '0xAddressOrg001',
            name: 'Org1',
            blindSigKey: { // RSA keypair
              N: '76371029918972468664941514738317813949700823831516674062130698696256739747471',
              E: '65537'
            }
          },
          {
            id: '2',
            address: '0xAddressOrg002',
            name: 'Org2',
            blindSigKey: {
              N: '84363999601518293055825661401325254763629655239082503904477611930728364455689',
              E: '65537'
            }
          },
          {
            id: '3',
            address: '0xAddressOrg003',
            name: 'Org3',
            blindSigKey: {
              N: '67478541602739783545562006148578430599142391044897235744290252182816844486133',
              E: '65537'
            }
          }
        ],
        votes: [
          {
            voteString: '0x01bbab60d3005bbc9db834bf58e07b3e032e707aa973f7dfac8779a284829930',
            unblinded: '65937745349377934968489273755828617010397835858014346381572778641592221017125',
            organizerId: '2'
          },
          {
            voteString: '0x0120b2b98cb75612b768e6f52fb7f748c65fbe5a72a63f0adc912891087c4ece',
            unblinded: '46985358407099348455216378031503160899419627302873814735103812775775572857004',
            organizerId: '3'
          },
          {
            voteString: '0x021d40f1e5057ea1c6cf6f6c3188ac42ff73d136c95b392a9d3b6ddd12b5003c',
            unblinded: '37881386293922167714176853095432947971442389430915889429350455432496410852535',
            organizerId: '1'
          },
          {
            voteString: '0x02b191b1c2b662dc3c38b70c8575e6111f3683849077fac032c05d01d1e04e6f',
            unblinded: '22737410541375570743358349133723055604108610733775041082390708013880662252612',
            organizerId: '3'
          },
          {
            voteString: '0x012a6162e8d64812ae3e562639246c81704e053a85298bbfdf0f14534172adbc',
            unblinded: '1053479476688851512653090824338673287933277658885555590890861742363844362997',
            organizerId: '1'
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