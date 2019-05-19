import React, { Component } from "react";
import { Form, Header, Radio } from 'semantic-ui-react';

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
      }
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

  render() {
    return (
      <div>
        <CandidatesChoices
          candidates={this.state.votingContract.candidates}
          candidateChoice={this.state.choice}
          onChange={this.handleChangeChoice}
        />
      </div>
    );
  }
}

export default VotePreparationVoter;