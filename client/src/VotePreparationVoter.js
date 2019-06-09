import React, { Component } from "react";
import { Button, Form, Header, Modal, Radio, TextArea } from 'semantic-ui-react';
import * as Utils from 'web3-utils';
import * as BlindSignature from './rsablind.js';
import TxStatus from './TxStatus';

function CandidatesChoices(props) {
  const {candidates, candidateChoice, onChange} = props;
  let isCandidateChecked = (candidateId) => {
    return candidateChoice.id === candidateId;
  }
  let onChoiceChange = (e, choice) => onChange(choice);
  const Candidates = candidates.map((candidate, index) => CandidateChoice(candidate, index, isCandidateChecked(index), onChoiceChange));

  return (
    <div>
      <Header>
        Candidates Choice
      </Header>
      <Form>
        <Form.Field>
          Selected candidate : <b>{candidateChoice.name}</b>
        </Form.Field>
        {Candidates}
      </Form>
    </div>
  )
}

function CandidateChoice(candidate, index, isCandidateChecked, onChangeCallback) {
  return (
    <Form.Field key={index}>
      <Radio
        label={candidate.value.name}
        name='candidateChoiceGroup'
        value={index}
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
  // Generates 32 bytes of voteString : 1 byte choiceCode + 31 random bytes
  const prefix = "0x";
  // Generate choiceCodeByte
  let choiceCodeByte = choiceId < 16 ? "0" : "";
  choiceCodeByte += parseInt(choiceId).toString(16);
  // Generate randomBytes
  let randomBytes = "";
  for (let i = 0; i < 62; i++) {
    randomBytes += parseInt(Math.floor(Math.random() * 16)).toString(16);
  }
  const voteString = prefix + choiceCodeByte + randomBytes;
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
      dataKeyCandidates: null,
      dataKeyCandidateIds: null,
      dataKeyCandidateCount: null,
      dataKeyOrganizers: null,
      dataKeyOrganizerAddresses: null,
      dataKeyOrganizerCount: null,
      stackIdRequestBlindSig: null,
      candidates: null,
      organizers: null,
      choice: {
        id: -1,
        name: ''
      },
      voteString: '',
      randomValue: '',
      modalOpen: false
    }
  }

  componentDidMount() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const dataKeyStatus = contract.methods.state.cacheCall();
    const dataKeyCandidateCount = contract.methods.candidateCount.cacheCall();
    const dataKeyOrganizerCount = contract.methods.organizerCount.cacheCall();
    this.setState({
      dataKeyStatus,
      dataKeyCandidateCount,
      dataKeyOrganizerCount
    });
  }

  componentDidUpdate() {
    const {drizzle} = this.props;
    const contract = drizzle.contracts.VotingContract;
    const {VotingContract} = this.props.drizzleState.contracts;

    const candidateCount = VotingContract.candidateCount[this.state.dataKeyCandidateCount];
    let dataKeyCandidateIds = [];
    if (this.state.dataKeyCandidateIds && parseInt(candidateCount.value) !== this.state.dataKeyCandidateIds.length) {
      // There is a change in candidateCount, reset dataKeys
      this.setState({
        dataKeyCandidates: null,
        dataKeyCandidateIds: null,
        candidates: null
      })
    }
    else if (candidateCount && this.state.dataKeyCandidateIds == null) {
      for (let i = 0; i < candidateCount.value; i++) {
        dataKeyCandidateIds.push(contract.methods.candidateIds.cacheCall(i));
      }
      this.setState({ dataKeyCandidateIds: dataKeyCandidateIds });
    }
    else if (this.state.dataKeyCandidateIds && this.state.dataKeyCandidates == null && VotingContract.candidateIds[this.state.dataKeyCandidateIds[this.state.dataKeyCandidateIds.length-1]]) {
      // Only do this if all dataKeyCandidateIds are already loaded
      let dataKeyCandidates = [];
      for (const dataKeyCandidateId of this.state.dataKeyCandidateIds) {
        const candidateId = VotingContract.candidateIds[dataKeyCandidateId];
        dataKeyCandidates.push(contract.methods.candidates.cacheCall(candidateId.value));
      }

      this.setState({ dataKeyCandidates: dataKeyCandidates });
    }
    else if (this.state.dataKeyCandidates && this.state.candidates == null && VotingContract.candidates[this.state.dataKeyCandidates[this.state.dataKeyCandidates.length-1]]) {
      // Only do this if all dataKeyCandidates are already loaded
      let candidates = [];
      for (const dataKeyCandidate of this.state.dataKeyCandidates) {
        const candidate = VotingContract.candidates[dataKeyCandidate];
        candidates.push(candidate);
      }

      this.setState({ candidates: candidates });
    }

    const organizerCount = VotingContract.organizerCount[this.state.dataKeyOrganizerCount];
    let dataKeyOrganizerAddresses = [];
    if (this.state.dataKeyOrganizerAddresses && parseInt(organizerCount.value) !== this.state.dataKeyOrganizerAddresses.length) {
      // There is a change in organizerCount, reset dataKeys
      this.setState({
        dataKeyOrganizers: null,
        dataKeyOrganizerAddresses: null,
        organizers: null
      })
    }
    else if (organizerCount && this.state.dataKeyOrganizerAddresses == null) {
      for (let i = 0; i < organizerCount.value; i++) {
        dataKeyOrganizerAddresses.push(contract.methods.organizerAddresses.cacheCall(i));
      }
      this.setState({ dataKeyOrganizerAddresses: dataKeyOrganizerAddresses });
    }
    else if (this.state.dataKeyOrganizerAddresses && this.state.dataKeyOrganizers == null && VotingContract.organizerAddresses[this.state.dataKeyOrganizerAddresses[this.state.dataKeyOrganizerAddresses.length-1]]) {
      // Only do this if all dataKeyOrganizerAddresses are already loaded
      let dataKeyOrganizers = [];
      for (const dataKeyOrganizerAddress of this.state.dataKeyOrganizerAddresses) {
        const organizerAddress = VotingContract.organizerAddresses[dataKeyOrganizerAddress];
        dataKeyOrganizers.push(contract.methods.organizers.cacheCall(organizerAddress.value));
      }

      this.setState({ dataKeyOrganizers: dataKeyOrganizers });
    }
    else if (this.state.dataKeyOrganizers && this.state.organizers == null && VotingContract.organizers[this.state.dataKeyOrganizers[this.state.dataKeyOrganizers.length-1]]) {
      // Only do this if all dataKeyOrganizers are already loaded
      let organizers = [];
      for (let i = 0; i < this.state.dataKeyOrganizers.length; i++) {
        const dataKeyOrganizer = this.state.dataKeyOrganizers[i];
        const organizer = VotingContract.organizers[dataKeyOrganizer];
        // Create organizer object
        organizers.push({
          id: i,
          address: organizer.args[0],
          name: organizer.value.name,
          blindSigKey: {
            N: organizer.value.N,
            E: organizer.value.E
          }
        });
      }
      this.setState({ organizers: organizers });
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
    const organizers = this.state.organizers;
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
    this.sendBallot(randomOrganizer.address, blinded.toString());
  }

  handleModalOpen = (isModalOpen) => { this.setState({ modalOpen: isModalOpen }) }

  sendBallot = (organizerAddress, blinded) => {
    const {drizzle, drizzleState} = this.props;
    const contract = drizzle.contracts.VotingContract;

    const stackId = contract.methods.requestBlindSig.cacheSend(
      organizerAddress,
      blinded,
      { from: drizzleState.accounts[0] }
    );
    this.setState({
      stackIdRequestBlindSig: stackId
    });
  }

  render() {
    return (
      <div>
        <CandidatesChoices
          candidates={this.state.candidates ? this.state.candidates : []}
          candidateChoice={this.state.choice}
          onChange={this.handleChangeChoice}
        />
        <br />
        <CreateBallot disabled={this.state.choice.id === -1} onClick={this.handleCreateBallot} />
        <TxStatus drizzleState={this.props.drizzleState} stackId={this.state.stackIdRequestBlindSig} />
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