import React, { Component } from "react";
import { Button, Form, Header, Modal, Radio, TextArea } from 'semantic-ui-react';
import * as Utils from 'web3-utils';
import * as BlindSignature from 'blind-signatures';

function CandidatesChoices(props) {
  const {candidates, candidateChoice, onChange} = props;
  let isCandidateChecked = (candidateId) => {
    return candidateChoice.id === candidateId;
  }
  let onChoiceChange = (e, choice) => onChange(choice);
  const Candidates = candidates.map((candidate) => CandidateChoice(candidate, isCandidateChecked(candidate.id), onChoiceChange));

  return (
    <div>
      <Header>
        Candidates Choice
      </Header>
      <Form>
        <Form.Field>
          Selected value : <b>{candidateChoice.name}</b>
        </Form.Field>
        {Candidates}
      </Form>
    </div>
  )
}

function CandidateChoice(candidate, isCandidateChecked, onChangeCallback) {
  return (
    <Form.Field key={candidate.id}>
      <Radio
        label={candidate.name}
        name='candidateChoiceGroup'
        value={candidate.id}
        checked={isCandidateChecked}
        onChange={onChangeCallback}
      />
    </Form.Field>
  )
}

function CreateBallot(props) {
  const {disabled, onClick} = props;

  return (
    <Button
      primary
      onClick={onClick}
      disabled={disabled}>
      Create Ballot
    </Button>
  );
}

function createVoteStringFromChoiceId(choiceId) {
  const voteStringLength = 64;
  const choiceCodeLength = 4;
  const randomStringLength = voteStringLength - choiceCodeLength;

  // Generate choiceCodeString
  let choiceCodeString = parseInt(choiceId).toString(2);
  while (choiceCodeString.length < choiceCodeLength) {
    choiceCodeString = "0" + choiceCodeString;
  }

  // Generate randomString
  let randomString = '';
  while (randomString.length < randomStringLength) {
    let randomChar = Math.round(Math.random() % 2).toString();
    randomString += randomChar;
  }

  const voteString = choiceCodeString + randomString;
  return voteString;
}

function BallotCreatedModal(props) {
  const {open, openCallback, randomValue, voteString} = props;
  let handleClose = () => openCallback(false);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeOnEscape={false}
      closeOnDimmerClick={false}
    >
      <Modal.Header>
        Vote has been sent
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>
            Please take note of these 2 values
          </Header>
          <Header>
            Vote string
          </Header>
          {voteString}
          <Header>
            Random value
          </Header>
          <Form>
            <TextArea value={randomValue} />
          </Form>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button primary onClick={handleClose}>
          OK
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

class VotePreparationVoter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votingContract: {
        status: "Preparation",
        result: "Voting result",
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
        voters: [
          {
            address: '0xAddress001',
            name: 'Name1'
          },
          {
            address: '0xAddress002',
            name: 'Name123'
          },
          {
            address: '0xAddress003',
            name: 'NameAs Df'
          }
        ],
        organizers: [ // Organizer account
          {
            id: '1',
            address: '0xAddressOrg001',
            name: 'Org1',
            blindSigKey: { // RSA keypair, D is private held by each organizer
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
        ]
      },
      choice: {
        id: -1,
        name: ''
      },
      voteString: '',
      randomValue: '',
      modalOpen: false,
      accountAddress: '0xAddress001'
    }
  }

  handleChangeChoice = (choice) => {
    this.setState({
      choice: {
        id: choice.value,
        name: choice.label
      }
    })
  }

  handleCreateBallot = () => {
    const voteString = createVoteStringFromChoiceId(this.state.choice.id);
    console.log("Vote string : " + voteString);
    const organizers = this.state.votingContract.organizers;
    const randomOrganizer = organizers[Math.floor(Math.random() * organizers.length)];
    const {blinded, r} = BlindSignature.blind({
      message: Utils.soliditySha3(voteString),
      N: randomOrganizer.blindSigKey.N,
      E: randomOrganizer.blindSigKey.E
    })
    console.log("Blinded vote to be sent to organizer id " + randomOrganizer.id + " : " + blinded);
    console.log("Random r to be noted by voter : " + r);
    this.setState({
      voteString: voteString.toString(),
      randomValue: r.toString(),
      modalOpen: true
    });

    // Send blinded vote to VotingContract (including the organizer that will sign)
    const message = {
      requesterAddress: this.state.accountAddress,
      organizerId: randomOrganizer.id,
      blinded: blinded.toString()
    }
    console.log("Send : " + JSON.stringify(message));
    console.log(randomOrganizer);
  }

  handleModalOpen = (isModalOpen) => { this.setState({ modalOpen: isModalOpen }) }

  render() {
    return (
      <div>
        <CandidatesChoices
          candidates={this.state.votingContract.candidates}
          candidateChoice={this.state.choice}
          onChange={this.handleChangeChoice}
        />
        <br />
        <CreateBallot disabled={this.state.choice.id === -1} onClick={this.handleCreateBallot} />
        <BallotCreatedModal
          open={this.state.modalOpen}
          openCallback={this.handleModalOpen}
          randomValue={this.state.randomValue}
          voteString={this.state.voteString}
        />
      </div>
    );
  }
}

export default VotePreparationVoter;