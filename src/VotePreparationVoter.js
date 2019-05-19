import React, { Component } from "react";
import { Button, Form, Header, Radio } from 'semantic-ui-react';

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
        ]
      },
      choice: {
        id: -1,
        name: ''
      },
      voteString: ''
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
    this.setState({
      voteString: createVoteStringFromChoiceId(this.state.choice.id)
    });
  }

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
      </div>
    );
  }
}

export default VotePreparationVoter;