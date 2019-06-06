pragma solidity ^0.5.8;

contract VotingContract {
    // Variables
    enum State {
        Preparation,
        Registration,
        Voting,
        Tallying,
        Finished
    }
    State public state;
    uint256 public endPreparationTime;
    uint256 public endRegistrationTime;
    uint256 public endVotingTime;

    struct Candidate {
        string name;
        uint256 voteCount;
        bool exists;
    }
    mapping(uint8 => Candidate) public candidates; // uint8 candidateId (bytes1) to Candidate
    bytes1[] public candidateIds;
    uint8 public candidateCount;

    struct Organizer {
        string name;
        uint256 N;
        uint256 E;
        bool exists;
    }
    mapping(address => Organizer) public organizers;
    address[] public organizerAddresses;
    uint256 public organizerCount;

    struct Voter {
        string name;
        uint256 blinded;
        uint256 signed;
        address signer;
        bool exists;
    }
    mapping(address => Voter) public voters;
    address[] public voterAddresses;
    uint256 public voterCount;

    struct RegisterRequest {
        address registrarAddress;
        string name;
        bool exists;
    }
    mapping(bytes32 => RegisterRequest) public registerRequests; // bytes32 hashedNIK to RegisterRequest
    bytes32[] public registers;
    uint256 public registerCount;

    struct BlindSigRequest {
        address requester;
        address signer;
        bool signed;
    }
    mapping(uint256 => BlindSigRequest) public blindSigRequests;
    uint256[] public blinds;
    uint256 public blindCount;

    struct Vote {
        bytes32 voteString;
        uint256 unblinded;
        address signer;
        bool counted;
    }
    Vote[] public votes;
    uint256 public voteCount;
    mapping(bytes32 => bool) public voteExists; // bytes32 voteString to bool
    uint256 public countedVotes;

    // Events

    // Functions
    constructor(
        string memory name,
        uint256 N,
        uint256 E,
        uint256 endPreparationTimestamp,
        uint256 endRegistrationTimestamp,
        uint256 endVotingTimestamp
    )
        public
    {
        state = State.Preparation;
        organizers[msg.sender] = Organizer(
            name,
            N,
            E,
            true
        );
        organizerAddresses.push(msg.sender);
        organizerCount++;
        endPreparationTime = endPreparationTimestamp;
        endRegistrationTime = endRegistrationTimestamp;
        endVotingTime = endVotingTimestamp;
    }

    modifier onlyOrganizer {
        require(organizers[msg.sender].exists, "Not an organizer");
        _;
    }

    modifier onlyVoter {
        require(voters[msg.sender].signer != address(0), "Not a voter");
        _;
    }
    // fallback function (if exists)
    // external
    // public
    function addCandidate(
        string memory name
    )
        public
        onlyOrganizer
    {
        require(state == State.Preparation, "State is not preparation");
        candidates[uint8(candidateIds.length)] = Candidate(
            name,
            0,
            true
        );
        candidateIds.push(bytes32(candidateIds.length)[31]);
        candidateCount++;
    }

    function addOrganizer(
        address organizerAddress,
        string memory name,
        uint256 N,
        uint256 E
    )
        public
        onlyOrganizer
    {
        require(state == State.Preparation, "State is not preparation");
        require(!organizers[organizerAddress].exists, "Organizer already exists");
        organizers[organizerAddress] = Organizer(
            name,
            N,
            E,
            true
        );
        organizerAddresses.push(organizerAddress);
        organizerCount++;
    }

    function registerRequest(
        string memory name,
        bytes32 hashedNIK
    )
        public
    {
        require(state == State.Registration, "State is not registration");
        require(!registerRequests[hashedNIK].exists, "Register request already exists");
        registerRequests[hashedNIK] = RegisterRequest(msg.sender, name, true);
        registers.push(hashedNIK);
        registerCount++;
    }

    function register(
        uint256 index,
        bytes32 hashedNIK
    )
        public
        onlyOrganizer
    {
        require(state == State.Registration, "State is not registration");
        require(index < registers.length, "Index out of array bounds");
        require(registers[index] == hashedNIK, "Wrong register index");
        require(registerRequests[hashedNIK].exists, "Register request does not exist");
        registerRequests[hashedNIK].exists = false;
        // "Delete" registers array at index by swapping the last element
        registers[index] = registers[registers.length-1];
        delete registers[registers.length-1];
        registers.length--;
        registerCount--;
    }

    function addVoter(
        address voterAddress,
        string memory name
    )
        public
        onlyOrganizer
    {
        require(state == State.Registration, "State is not registration");
        require(!voters[voterAddress].exists, "Voter is already registered");
        voters[voterAddress] = Voter(
            name,
            uint256(0),
            uint256(0),
            address(0),
            true
        );
        voterAddresses.push(voterAddress);
        voterCount++;
    }

    function requestBlindSig(
        address signer,
        uint256 blinded
    )
        public
        onlyVoter
    {
        require(state == State.Voting, "State is not voting");
        require(blindSigRequests[blinded].requester == address(0), "Blind exists");
        blindSigRequests[blinded] = BlindSigRequest(
            msg.sender,
            signer,
            false
        );
        blinds.push(blinded);
        blindCount++;
        voters[msg.sender].blinded = blinded;
    }

    function signBlindSigRequest(
        address requester,
        uint256 blinded,
        uint256 signed
    )
        public
        onlyOrganizer
    {
        require(state == State.Voting, "State is not voting");
        require(blindSigRequests[blinded].requester != address(0), "Blind does not exist");
        require(blindSigRequests[blinded].signer == msg.sender, "Organizer is not the designated signer");
        require(!blindSigRequests[blinded].signed, "Request is already signed");
        blindSigRequests[blinded].signed = true;
        voters[requester].signed = signed;
    }

    function vote(
        bytes32 voteString,
        uint256 unblinded,
        address signer
    )
        public
    {
        require(state == State.Voting, "State is not voting");
        // Make sure voter is not using its registered account
        require(!voters[msg.sender].exists, "Vote sender is registered as voter");
        // Check if voteString has been used
        require(!voteExists[voteString], "Vote string exists");

        // Verify voteString with unblinded if its signed by signer
        bytes32 message = keccak256(abi.encode(voteString));
        uint256 N = organizers[signer].N;
        uint256 E = organizers[signer].E;
        require(verifyBlindSig(unblinded, N, E, message), "Blind signature is incorrect");

        // Store the votes
        addVote(voteString, unblinded, signer);
    }

    function tally(uint256 votesToTally) public onlyOrganizer {
        require(state == State.Tallying, "State is not tallying");
        require(countedVotes + votesToTally - 1 <= votes.length, "Attempting to tally more than uncounted votes");

        uint256 startIndex = countedVotes;
        uint256 endIndex = countedVotes + votesToTally - 1;
        for (uint256 i = startIndex; i <= endIndex; i++) {
            // get votes[i]
            uint8 candidateId = uint8(votes[i].voteString[0]);
            // check candidateId from votes[i].voteString
            candidates[candidateId].voteCount++;
            // Mark vote as counted
            votes[i].counted = true;
            // candidate[candidateId].voteCount++
            countedVotes++;
        }

        if (countedVotes == votes.length) {
            endTally();
        }
    }

    function endPreparation() public onlyOrganizer {
        require(state == State.Preparation, "State is not preparation");
        require(block.timestamp >= endPreparationTime, "Preparation time has not ended yet");
        state = State.Registration;
    }

    function endRegistration() public onlyOrganizer {
        require(state == State.Registration, "State is not registration");
        require(block.timestamp >= endRegistrationTime, "Registration time has not ended yet");
        state = State.Voting;
    }

    function endVoting() public onlyOrganizer {
        require(state == State.Voting, "State is not voting");
        require(block.timestamp >= endVotingTime, "Voting time has not ended yet");
        state = State.Tallying;
    }
    // internal
    // private
    function verifyBlindSig(
        uint256 unblinded,
        uint256 N,
        uint256 E,
        bytes32 message
    )
        public
        returns (bool result)
    {
        bytes32 originalMessage = bytes32(expmod(unblinded, E, N));
        bytes32 hashMessage = keccak256(abi.encode(message));
        result = hashMessage == originalMessage;
    }

    function endTally() private {
        state = State.Finished;
    }

    function addVote(
        bytes32 voteString,
        uint256 unblinded,
        address signer
    )
        private
    {
        // Check if candidateId from voteString is correct
        require(candidates[uint8(voteString[0])].exists, "Invalid candidate id");
        votes.push(Vote(voteString, unblinded, signer, false));
        voteCount++;
        voteExists[voteString] = true;
    }

    // Source : https://medium.com/@rbkhmrcr/precompiles-solidity-e5d29bd428c4
    // Calling expmod precompile
    function expmod(uint256 base, uint256 e, uint256 m) private returns (uint256 o) {
    // are all of these inside the precompile now?

    assembly {
        // define pointer
        let p := mload(0x40)
        // store data assembly-favouring ways
        mstore(p, 0x20)             // Length of Base
        mstore(add(p, 0x20), 0x20)  // Length of Exponent
        mstore(add(p, 0x40), 0x20)  // Length of Modulus
        mstore(add(p, 0x60), base)  // Base
        mstore(add(p, 0x80), e)     // Exponent
        mstore(add(p, 0xa0), m)     // Modulus
        // call modexp precompile! -- old school gas handling
        let success := call(sub(gas, 2000), 0x05, 0, p, 0xc0, p, 0x20)
        // gas fiddling
        switch success case 0 {
            revert(0, 0)
        }
        // data
        o := mload(p)
        }
    }
}