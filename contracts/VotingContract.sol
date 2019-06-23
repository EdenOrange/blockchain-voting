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
        bool exists;
    }
    mapping(uint256 => BlindSigRequest) public blindSigRequests;
    uint256[] public blinds;
    uint256 public blindCount;

    struct Vote {
        uint256 encryptedVoteString;
        uint256 encryptedUnblinded;
        address signer;
        bool counted;
        bool valid;
    }
    Vote[] public votes;
    uint256 public voteCount;
    mapping(uint256 => bool) public voteExists; // uint256 encryptedVoteString to bool
    uint256 public countedVotes;
    uint256 public validVotes;

    uint256 public pubKeyE; // Public key (E) used for encrypting vote
    uint256 public pubKeyN; // Public key (N) used for encrypting vote
    uint256 public decKey; // Decryption key for tallying

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
        require(voters[msg.sender].exists, "Not a voter");
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
        require(!voters[msg.sender].exists, "Voter is already registered");
        require(!registerRequests[hashedNIK].exists, "Register request already exists");
        registerRequests[hashedNIK] = RegisterRequest(msg.sender, name, true);
        registers.push(hashedNIK);
        registerCount++;
    }

    function registerVoter(
        uint256 index,
        bytes32 hashedNIK,
        address voterAddress,
        string memory name
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

        addVoter(voterAddress, name);
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
        require(voters[msg.sender].blinded == 0, "Voter already request blind signature before");
        blindSigRequests[blinded] = BlindSigRequest(
            msg.sender,
            signer,
            true
        );
        blinds.push(blinded);
        blindCount++;
        voters[msg.sender].blinded = blinded;
        voters[msg.sender].signer = signer;
    }

    function signBlindSigRequest(
        uint256 index,
        address requester,
        uint256 blinded,
        uint256 signed
    )
        public
        onlyOrganizer
    {
        require(state == State.Voting, "State is not voting");
        require(index < blinds.length, "Index out of array bounds");
        require(blinds[index] == blinded, "Wrong blind index");
        require(blindSigRequests[blinded].exists, "Blind sig request does not exist");
        require(blindSigRequests[blinded].signer == msg.sender, "Organizer is not the designated signer");
        voters[requester].signed = signed;
        blindSigRequests[blinded].exists = false;
        // "Delete" blinds array at index by swapping the last element
        blinds[index] = blinds[blinds.length-1];
        delete blinds[blinds.length-1];
        blinds.length--;
        blindCount--;
    }

    function vote(
        uint256 encryptedVoteString,
        uint256 encryptedUnblinded,
        address signer
    )
        public
    {
        require(state == State.Voting, "State is not voting");
        // Make sure voter is not using its registered account
        require(!voters[msg.sender].exists, "Vote sender is registered as voter");
        // Check if voteString has been used
        require(!voteExists[encryptedVoteString], "Encrypted vote string exists");

        // Store the vote, vote might not be valid
        votes.push(Vote(encryptedVoteString, encryptedUnblinded, signer, false, false));
        voteCount++;
        voteExists[encryptedVoteString] = true;
    }

    function tally(uint256 votesToTally) public onlyOrganizer {
        require(state == State.Tallying, "State is not tallying");
        require(countedVotes + votesToTally - 1 <= votes.length, "Attempting to tally more than uncounted votes");
        require(decKey != 0, "No published decryption key yet");

        uint256 startIndex = countedVotes;
        uint256 endIndex = countedVotes + votesToTally - 1;
        for (uint256 i = startIndex; i <= endIndex; i++) {
            // Get the vote and decrypt it
            bytes32 voteString = bytes32(expmod(votes[i].encryptedVoteString, decKey, pubKeyN));
            uint256 unblinded = expmod(votes[i].encryptedUnblinded, decKey, pubKeyN);

            // Verify voteString with unblinded if its signed by signer
            address signer = votes[i].signer;
            uint256 N = organizers[signer].N;
            uint256 E = organizers[signer].E;
            if (verifyBlindSig(unblinded, N, E, voteString)) {
                uint8 candidateId = uint8(voteString[0]);
                if (candidateId < candidateCount) {
                    candidates[candidateId].voteCount++;
                    // Mark vote as valid for informational purposes
                    votes[i].valid = true;
                    validVotes++;
                }
            }

            votes[i].counted = true;
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

    function endRegistration(uint256 E, uint256 N) public onlyOrganizer {
        require(state == State.Registration, "State is not registration");
        require(block.timestamp >= endRegistrationTime, "Registration time has not ended yet");
        state = State.Voting;
        pubKeyE = E;
        pubKeyN = N;
    }

    function endVoting(uint256 D) public onlyOrganizer {
        require(state == State.Voting, "State is not voting");
        require(block.timestamp >= endVotingTime, "Voting time has not ended yet");
        state = State.Tallying;
        decKey = D;
    }
    // internal
    // private
    function addVoter(
        address voterAddress,
        string memory name
    )
        private
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

    function verifyBlindSig(
        uint256 unblinded,
        uint256 N,
        uint256 E,
        bytes32 voteString
    )
        private
        returns (bool result)
    {
        bytes31 originalVoteString = bytes31(bytes32(expmod(unblinded, E, N)) << 8);
        bytes31 hashVoteString = bytes31(keccak256(abi.encode(voteString)));
        result = hashVoteString == originalVoteString;
    }

    function endTally() private {
        state = State.Finished;
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