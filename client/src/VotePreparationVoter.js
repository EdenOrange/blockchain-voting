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
              N: '29966692371364866625346898353663834134938385542002417037721577477302102136522085939472165345604159090008369291967229214089843550402783764345171829774118370421727069328975236719404868237298550523989366936116144150572205603225580613276301181810980227503747111091217434069794434110873713548193276565135873156551776781744977506384102252699464204349946745613824014413457618301726927010747822355674379832350188825717228418277968661184894099448068813151646552494933847934355517511397146924721973857101644904751900691439081133481472498369847582949341542277140564618444421223545987899994237990578140719418027385682765400810787',
              E: '65537'
            }
          },
          {
            id: '2',
            address: '0xAddressOrg002',
            name: 'Org2',
            blindSigKey: {
              N: '26458970144176529231278251478923876274581682945160630211923288556492285074551812817562954732957996890856225708775063710963505080257659492810452589951505161037289950403780584424848427034382647213927966088689259773969220432507351297342517879366775210437071365276681805376039406952355809450845271748916810754673242718443536347275958685398465694101786361797986578701119612608844428824062586235437039817380062355856918189315480847660878662520951404772466376423110443487482138333887388449385867806705579043254110057834686860727136742974754338482731437361733622421487674030607511342064989032215407906503194121394165185383797',
              E: '65537'
            }
          },
          {
            id: '3',
            address: '0xAddressOrg003',
            name: 'Org3',
            blindSigKey: {
              N: '22174933060533612279001839757293277558447636625990692079946257223347032594943597488661968989040186738935132503446965285010055923873177882577484769463195499109178479501165613614043668876610322147551149096608999387482124244500100367766728152174625193206582596173771525689770346002747421347904671941536291573608005763407437768868993893358554277826661660885093146948296152543868273304544471129280791068975551329074059044323118982282750362281455605896422650475741100638391510715626109674650392999767613861555822958045214362249243277613528444450124436766949894713659037566339120415451310965138637574175225632109970533494113',
              E: '65537'
            }
          },
          {
            id: '4',
            address: '0xAddressOrg004',
            name: 'Org4',
            blindSigKey: {
              N: '16775050148364882245462320022645711979084082808337620100786492237178276323524241257195211673938644093147897800612374614522663611735101343119890322873849442378422327932652134334846956087038755944911232948970295492128892561484459845274903194935038106971311360097576103899315925905098692697717803827791144026274296101244412223223470049083265942846444612408948173048910727508457418654464393545886905333474218934459199740388726253551580709423439681120085669619756873014277697219857743030398799514005464917922078134642831348625190313140985084331196622556515915406432281755384503209496762260136702417829129242855897174049259',
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