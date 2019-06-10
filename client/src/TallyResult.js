import React, { Component } from "react";
import { List } from 'semantic-ui-react';

function CandidateResult(candidateName, candidateVoteCount) {
  return (
    <List.Item key={candidateName}>
      <List.Content>
        <List.Header>
          {candidateName}
        </List.Header>
        <List.Description>
          Votes : {candidateVoteCount}
        </List.Description>
      </List.Content>
    </List.Item>
  );
}

class TallyResult extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    const {candidates, status} = this.props;

    if (!(status === '3' || status === '4')) {
      return (
        <div></div>
      );
    }

    const tallyResult = [];
    for (const candidate of candidates) {
      tallyResult.push({
        name: candidate.value.name,
        voteCount: candidate.value.voteCount
      })
    }
    tallyResult.sort((a, b) => a.voteCount > b.voteCount ? -1 : 1); // Sort result by votes descending
    const Result = tallyResult.map((candidateResult) => CandidateResult(candidateResult.name, candidateResult.voteCount));

    return (
      <List divided>
        {Result}
      </List>
    );
  }
}

export default TallyResult;