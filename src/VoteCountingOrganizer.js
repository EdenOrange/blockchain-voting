import React, { Component } from "react";
import { Button, Divider, Header, List } from 'semantic-ui-react';
import * as Utils from 'web3-utils';
import * as BlindSignature from 'blind-signatures';

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
            blinded: '8117975862917616535203718728602315406509229351456348863271583252693908129483894965413868668676582835024120203152406206179841103968205373673241202022023197496725021324889571998404014951244114098103107790113395999189612989068524272417870062707450998159226390751618499722331935458700129309014810606210676933652613780685600951963700650668849019598714971483131432996646634688172167561959590162519354828149722613644783322013894821101150557745067989547015710335006054311416838393323067656249323161325255888883913547391059590768886852737976929010488680748670195765386680031867083255345599718567594455436661909201209858908355',
            signed: '8180767865253100348357408387782497295059120671132424365666555363594365053000919566987361451348710725719885220362185477324629174527874452765007751665182636672017982343229753296380781061384263912936928000002654902150148272990615942424239145191416267808958287722337600831874852212924967126530016215966845216646297789690675179735828123603788215955356920988050747932733565567248776232557218663306564462330002908283291368148361465270405529504195802994562468151240985375508509739024931310436524870583343831318484364810644449720931491101402150433106173353030522671503379391011234540984202195170459448630549147495202527523729',
            organizerSignerId: '1'
          },
          {
            address: '0xAddress002',
            blinded: '10145883455508304424376424789191660177315674526812815344053896875467701943870049050198462341215442736284733159621596280275966379824261730345568090959268140246254212876140034182979756583077964289309009779033823331031845719048340274516829951037813099583208580780385473043878516244314605222536072448873716968483927443789661315980833622256602277611028407238365549625359621826826933145925779453356022179552570083166303910667013198081630015311018667885424046975945423612077135934759835287549552850534891657683046690291104064446167139947179609447876344069634656814275426941572011333996105011405910002872512432552199258003214',
            signed: '1114901750568887734519072023383500372970961931317065897951517660057989643103850707002177859326652174943987879915716803970730073580675680892827147780657977045703918374699406946374358535659101030353792328966718442953208792160849023906491741833872500727365536965498098226535156217805267384048409968232386459565910893037135877808737168750428275219045274400658882718104328704552547066554677108323036582893194814286754953259919326055318692752348901274537055134912887881470160332118220339993782535103928235957200178299375764913913262313940853864502061151486777137729010528710925382387709916283455535603944042219186969943244',
            organizerSignerId: '3'
          },
          {
            address: '0xAddress003',
            blinded: '11566375081294495229943018748317249171524310348424102372045812540827225743880827655800744612142007996363781763425792158425432455493721507141481080833685436314855974699982536568749609148665875852751472573093842683593376841514690810725583447827118771687989532854299863534349039781995267892280446654686987700403956647210332388726824438451223879910056604353969933299166877978714507766619224610767500792995046076342069048708104182536649101871081752714243629376742462682798493758247265147824169098740648907485362029264225041674195799954030558623267775385804790748826147870353283412595193346570818291891767430701734068908954',
            signed: '16935251572065563892632935300392370458184367898757197060518165833751391959749993775840051994757667329534004407901133094936276881037121417075301557874159876783547973484453093036737894446864728958569778472987238553634514606207049180983836909700337398595462707989530893196872311326725877002437525553360523627120326365893892610258676122291035988901402460115413954352237802240678705895731579393707184184943800854480844591616301655783425901965345660935122397734373502121696313174394788968596264704351207229708720024478144508297028563990725225012449905898882943166429142795120671816583118160122553573649112995714247324966171',
            organizerSignerId: '3'
          },
          {
            address: '0xAddress004',
            blinded: '15345650910784553321802597487532095762724997020844627583267996710596877945366069797006677671676247774087624267248279737426455487214846188495725810305392153427594821459183118972284817536193240576667181882312402810626737378769731707125853885654822334419770975422871603413027263271237385565197149192624748952680441395657387165979658331374202169859717741971530037007081745806982061619608086729712533672886176987234424929347941984590068404546069697645984588988081495276981495353081166899195665261153710774737552259560291408550129569768107041389907815432101705535764721123185873189049230443177713828477096848767328375483698',
            signed: '8073804088774219268710373721048194335704560687830092044110513543576412867789922053963151759044017156465519274266006361574015487740071721473691553585557377525482800923810475090099949098672475844426391376532816047450727945087987061789623429765396583546513579654204834070892661575880186441838399366478021491398402434731978714394655017668935434057870395479676902083257093062095156721790800794295602046914759674242557911071542083370976001293233076135998403871235574836333906008024633136144386751384417900651110170041241523544736084280445491705994704324340204484236399115063534584348997811535510841206248482275829522452878',
            organizerSignerId: '2'
          },
          {
            address: '0xAddress005',
            blinded: '10245731460611582307838834390266903472478162720955258633103960305602638609376006879342085494433040990367910141488134080575291156567979142576700991497929961498643834727252717271647750372131796139014590230797179027484813733800377483828086187431779157915943459788655535467224612377174372258832378204491434729966314663619011131335090277663608234939821993702516656829965192569901779373182656781521202411844965413858816404959092107406459252381866253356019944767045537178278676142294478449992308803809837776259659417582153238100456936995263388497735512394880176566466535050858605989408787222967285771891396603165442661998539',
            signed: '16572039929905464990432335887978555309848257273898599383745571405273230653710959635639894274969416443926045543599140215081517636343394131827607498881751575836384411222978690415325852636904424263213577154901244134318517719145178123907785031168260284138828782862955999100245806840621929705803435699409402399853794477505623649568338936348444834148415541738567814252236869030128832373609442550649734291346718929423450060299181803873170193761001301379444017242234647083834130657220275349531385728885799473184100518282845759530519618329292807640976640531455392546285850677315656141353403356875141990950375626225859569864471',
            organizerSignerId: '2'
          },
          {
            address: '0xAddress006',
            blinded: '10370840196842416147582479290891520121971831713945853808453356195745034902107150006224851613151070424918498953145962791905405146307715063280502820601604040927048676413610960819050331746330781286208202826378856868155503644643285785502893984601470886021894554385483556595929659317057138747420878166263584879369112804821174339467889087112652581289143598725126610936576398122286105805318524017845217360919570773111738366125776310781886050781295742263211492290712020769502327220680213484663572618118202668634218632887480476301471187980386009444613942780284437565687294696640136082452739516498442237873822421368276711739444',
            signed: '17332328332241257653489596534052941733371958982788236647412966509110884988598806724915762248368761174575763217323444062900100469272268204588370106468611659398630951069444849060550889234266764341303297470742232290173524016376563176210447899916441935951482417748230036713377026102142899528047334700996967359686046424605126507630953405053153477698980930715496758578374940364766516944868947724275992745008014021261947788597034327862555542316168285070000704626341311421489949639003119781723976277117859820619919628810859789075452335712913414373774561568912551712149288566585259875751746300433201965797217965610367431903770',
            organizerSignerId: '1'
          },
          {
            address: '0xAddress007',
            blinded: '12892477465193237015436448410101168217188413629704576128729749561616579976398137107780106409048143158044343144203439849633903864171943542679014063728283865777983811268989725919673343668842780397038657616587090454560759848020558706266487204491736718684342695081929526729799070165929831956084015653023870709163647977654315329030934597206300314698274585425898016687841017431235389001829271968280870039349908518385358278540338885086541056365149447623323389921625596558408372580076360903327086386941404179716176992495360430636743121134771959053160792882770065284697939753750060911349301386782796763070099442574018281444134',
            signed: '15731228559197428525140147449755451917654963901820314958920846257057814112504322657887553122685731798321879206912565983832382141648797353731081308403907880494807587398505911412447175259227625639869225263489045825431178081449245548404118928277616721728719760785348370024902161744420218378565463163684326105921498122044299184398256361835734219879014768053036017396249055690394829849132632962072892993444682809962401060107592176307589036115226394599896032598722659699101841283719815514790954974304132325019079396184756848905416451928940117663755273790088492509371952162180072943704895543507167224554808075091392847626367',
            organizerSignerId: '4'
          }
        ],
        organizers: [ // Organizer account
          {
            id: '1',
            address: '0xAddressOrg001',
            name: 'Org1',
            blindSigKey: { // RSA keypair
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
        ],
        votes: [
          {
            voteString: '0001111101110001010110110011001101110101011010110000101001001110',
            unblinded: '5775523647910759022487094875387833371247047476084517022754912635017499915625936752776426518926893637763666383630784303630302197862710475264934337974082147676595655989616859648174538949568155686119777811592359069134152467689490113945545800748289273129509731000717540547355003026556360384973930818965927775493674147587405604227529963521338479438914853196502026920094728598779762086031527658896430512496944376735909030798946502468251759066859468551268833167910670467659807761810816363684638150917111014987551477633965102867141859287829038337880932850100617156364509486130030990459075186281496338024489827467717417693379',
            organizerId: '1'
          },
          {
            voteString: '0010001011001101100100000011101101001011001001101111100110100010',
            unblinded: '4519354716947870862906925468451144159345828426853775810744565931283524394156631683423183694912262142866769355251486751030745350659110783561331836536057681187631005607796362141158403699961776583624004927107913148738513470648137668512387973797440726560941920265310730952442357251063121602713690511642741010602773800683357798236048151857240092242761935712685697901435315738641618703670649122534634750408675371349899274271776637715257994428245449834426007018126052445245579095193187256491631209775038519177800014968507906145821497283259277083472081448681329804217888776741495151190706491118452292174691626217901365968216',
            organizerId: '3'
          },
          {
            voteString: '0001011100110110010011011101101100000001000101010111110010101110',
            unblinded: '20089906843650283569626085244877297285209871342579074405188641146623518857199535332316245107732164799278517713645324974294744814897135767464526858111903335345030929877662105725251975940621465911771102915246591016283632012904885393790093659394800716845165700088207760172990028634546829244483741993936559811234229872884319678185165902199063370053449346428363217919540297942873179748077379524746453933126534408167777964057536096499029688197030633694207277892586507106175806742533050360288339787267060022933560895997560332941779768285377954770910990313681438014815811519643904840239445434276077504101728077069193959135244',
            organizerId: '3'
          },
          {
            voteString: '0010010011000101110110100001101101110011010011001011111100001101',
            unblinded: '150274253345338644060516696489469194078265396595458253066406834767304293959294453119602866735865871091747781761071624023805214780102700292118395077110406721508969135454197775833405669835261825879016178915348696846696187573395577755289027936692417758285773989672312272228404147274540301899493152370523264711060898105645682820852053450194572250118064955264191300988304968851389679830788813177153240288858252945263431933160694102658422463011635350151141079879725987431256744665721663758200393108711573205989604937072135779730075749685298966333870999405368971749372650828774799522722976388792208747023481778990926026352',
            organizerId: '2'
          },
          {
            voteString: '0001100111001101000111000101011001010010100111010100001011000101',
            unblinded: '6432066029294050519327700017260271221558846964801748904409902239751584644541444525419535669197814254060411252794217759467599470151876864139072990059203368770623871177915032438203242769564904496675052398842181591133770846234888114181191772838797271758723619212104664577324381954736429566387749377267731830042617321665585370171118557161361078543411575627979282913657288326912347840017712626187793334142778502883468814627688713689222746154817337533832742825725985684339876741560089008476536775136194713538623072765152240429350127186225591895065417800767387583657145693862605307546083970264639852306209109398764100488879',
            organizerId: '2'
          },
          {
            voteString: '0010100101001010110100011110110100100110001010101111110101000100',
            unblinded: '2551885386811695833432414538816483907632023794346454197789879355875868219548164371779706873873857714535550995586635872293014873081431898834471901267305908182602286399087079409519040951721703534428851413002433955242800120893753255975082201487478643506808673907590121498736272469211282545797342484186949535283448409371254152864684495542448960737084721955966263536128376649559933117208798819745759533713641435680887867759762051147482144311754811160383677408473022180672681647831539988962717752709646138945953660643938999027829111983858369338918460143869511270888601452409916090172624785304613174667802165932509781269094',
            organizerId: '1'
          },
          {
            voteString: '0001101000111101101101111011100101000111110000010101110101100000',
            unblinded: '16614723032311951740945756452681857385203214900555477775673235410319914718485099277919725531807018062637751978950212226150405604287187332838819835792758339500722759089402776277484705681146625819092060612284052405750126819569555516218283717409995774440683304046586669188793255914421393741956181009612937233214399534118951403471553991257149009560182625396328469097957311799548027049145908789057603016989338394293656757444824977559130717925542759972855052824156839017840514605675917152186468505611315458673225015011028691853469780624038224398416558985696387718079491370747355883421256296383327291650386438377395085543056',
            organizerId: '4'
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