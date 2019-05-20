import React, { Component, useState } from "react";
import { Button, Input, List, Modal } from 'semantic-ui-react';
import * as BlindSignature from 'blind-signatures';
import { BigInteger } from 'jsbn';

function BlindSigRequests(props) {
  const {requests, organizerId, handleSign} = props;
  const Requests = requests.map((request) => {
    if (request.organizerId === organizerId) {
      return BlindSigRequest(request, handleSign);
    }
  });

  return (
    <List divided>
      {Requests}
    </List>
  );
}

function BlindSigRequest(request, signCallback) {
  const [privateKey, setPrivateKey] = useState('');
  let disableSign = privateKey === '';
  const [modalOpen, setModalOpen] = useState(false);
  let handleOpen = () => setModalOpen(true);
  let handleClose = () => {
    setModalOpen(false);
    setPrivateKey('');
  }

  return (
    <List.Item key={request.blinded}>
      <List.Content floated='right'>
      <Modal
          trigger={<Button primary onClick={handleOpen}>Sign this ballot</Button>}
          open={modalOpen}
          onClose={handleClose}
        >
          <Modal.Header>
            Sign this ballot
          </Modal.Header>
          <Modal.Content>
            <Input
              fluid
              placeholder='Private key...'
              onChange={(e) => setPrivateKey(e.target.value)}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button primary disabled={disableSign} onClick={() => {signCallback(request, privateKey); handleClose()}}>
              Sign
            </Button>
            <Button negative onClick={handleClose}>
              Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </List.Content>
      <List.Content>
        <List.Item>
          Address : {request.requesterAddress}
        </List.Item>
        <List.Item>
          Blinded vote : {request.blinded}
        </List.Item>
      </List.Content>
    </List.Item>
  );
}

class VotePreparationOrganizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votingContract: {
        blindSigRequests: [
          {
            requesterAddress: '0xAddress001',
            organizerId: '3',
            blinded: '106380571'
          },
          {
            requesterAddress: '0xAddress002',
            organizerId: '2',
            blinded: '26442040'
          },
          {
            requesterAddress: '0xAddress003',
            organizerId: '3',
            blinded: '58587046'
          },
          {
            requesterAddress: '0xAddress004',
            organizerId: '2',
            blinded: '198956025'
          },
          {
            requesterAddress: '0xAddress005',
            organizerId: '1',
            blinded: '43178287'
          },
          {
            requesterAddress: '0xAddress006',
            organizerId: '1',
            blinded: '59342630'
          }
        ]
      },
      organizerId: '1',
      organizers: [ // Organizer account
        {
          id: '1',
          address: '0xAddressOrg001',
          name: 'Org1',
          blindSigKey: { // RSA keypair
            N: 29966692371364866625346898353663834134938385542002417037721577477302102136522085939472165345604159090008369291967229214089843550402783764345171829774118370421727069328975236719404868237298550523989366936116144150572205603225580613276301181810980227503747111091217434069794434110873713548193276565135873156551776781744977506384102252699464204349946745613824014413457618301726927010747822355674379832350188825717228418277968661184894099448068813151646552494933847934355517511397146924721973857101644904751900691439081133481472498369847582949341542277140564618444421223545987899994237990578140719418027385682765400810787,
            E: 65537,
            D: 1327849529982202003143375388239311752565132240016708410173542594169481431930972390683540109611890657146105321022824261679919826515856448291169552980210259055261843070804951209746429304989776625748281452957585525935909258461130141766549866975587631119381137534658214879208432437523494577779777456172155814984289087482269085547544579770203041188479306903737828941926443439514969197918498919543773935981044034789534513672268519659105053513908698473628017633224527370382100880640612662936487538672611272459549958884865962440439310497356008441861580994978271935947909771746359597846371049341264710888559214959510653701633
          }
        },
        {
          id: '2',
          address: '0xAddressOrg002',
          name: 'Org2',
          blindSigKey: {
            N: 26458970144176529231278251478923876274581682945160630211923288556492285074551812817562954732957996890856225708775063710963505080257659492810452589951505161037289950403780584424848427034382647213927966088689259773969220432507351297342517879366775210437071365276681805376039406952355809450845271748916810754673242718443536347275958685398465694101786361797986578701119612608844428824062586235437039817380062355856918189315480847660878662520951404772466376423110443487482138333887388449385867806705579043254110057834686860727136742974754338482731437361733622421487674030607511342064989032215407906503194121394165185383797,
            E: 65537,
            D: 21682087852556578762619565980676667765177064598163657865501017927680824113535943167481246989235229305940668655717606796119673472011804065816033024754651337008219124867403699994453282479843753431252596530098367275905472989728051351508001933432910610441779722480189760863637278947407857341008061389376647108956909882837507480288548189565947593968833181989454247021073827570454841974321618658428920036949830594030239100468978668425496754974550114824474790046688476971640405930796213312409407846002802005107282954922944002295438025942847004653387765363820895113658221217163253517804037877216582664896393846402275542228513
          }
        },
        {
          id: '3',
          address: '0xAddressOrg003',
          name: 'Org3',
          blindSigKey: {
            N: 22174933060533612279001839757293277558447636625990692079946257223347032594943597488661968989040186738935132503446965285010055923873177882577484769463195499109178479501165613614043668876610322147551149096608999387482124244500100367766728152174625193206582596173771525689770346002747421347904671941536291573608005763407437768868993893358554277826661660885093146948296152543868273304544471129280791068975551329074059044323118982282750362281455605896422650475741100638391510715626109674650392999767613861555822958045214362249243277613528444450124436766949894713659037566339120415451310965138637574175225632109970533494113,
            E: 65537,
            D: 10061397523353639848152932038739534941758074411560785810905014034720041522243050718263764131072508550421519143727954586188855500744507949956880649171576077048240402619080224704017616578648466353046080375005953976931633222980224675159244828616882901951431101207306866165845415700103717307800072094443187302329961113906508533123613320219479963489171005554292481096064502173480164450510523436134686083895219974556164961523423617796845477418957884588140319486231615170321410713582141361518752454229869311622742219866866906941990336357138073037660817993199807859647451895257543889191589416438824169906926533538561468219393
          }
        }
      ]
    }
  }
  
  getCurrentOrganizerAccount = (organizerId) => {
    return this.state.organizers.find(organizer => organizer.id === organizerId);
  }

  handleSign = (request, privateKey) => {
    console.log("Sign ballot " + request.blinded + " with privateKey : " + privateKey);
    const key = {
      keyPair: {
        e: new BigInteger(this.getCurrentOrganizerAccount(this.state.organizerId).blindSigKey.E.toString()),
        n: new BigInteger(this.getCurrentOrganizerAccount(this.state.organizerId).blindSigKey.N.toString()),
        d: new BigInteger(privateKey.toString())
      }
    }
    const signed = BlindSignature.sign({
      blinded: request.blinded,
      key: key
    });
    console.log("Signed : " + signed);

    // Send signed vote to VotingContract
    const message = {
      requesterAddress: request.requesterAddress,
      signed: signed.toString()
    }
    console.log("Send : " + JSON.stringify(message));
  }

  render() {
    return (
      <div>
        <BlindSigRequests requests={this.state.votingContract.blindSigRequests} organizerId={this.state.organizerId} handleSign={this.handleSign}/>
      </div>
    );
  }
}

export default VotePreparationOrganizer;