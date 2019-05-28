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

    struct Candidate {
        uint256 id;
        string name;
    }
    Candidate[] public candidates;

    struct BlindSigKey {
        uint256 N;
        uint256 E;
    }

    struct Organizer {
        string name;
        BlindSigKey blindSigKey;
        bool exists;
    }
    mapping(address => Organizer) organizers;
    address[] public organizerAddresses;

    struct Voter {
        string name;
        uint256 blinded;
        uint256 signed;
        address signer;
        bool exists;
    }
    mapping(address => Voter) voters;
    address[] public voterAddresses;

    struct BlindSigRequest {
        address requester;
        address signer;
    }
    mapping(uint256 => BlindSigRequest) blindSigRequests;
    uint256[] blinds;

    struct Vote {
        uint256 voteString;
        uint256 unblinded;
        address signer;
        bool counted;
    }
    Vote[] public votes;

    // Events

    // Functions
    constructor(string memory name, uint256 N, uint256 E) public {
        state = State.Preparation;
        organizers[msg.sender] = Organizer(
            name,
            BlindSigKey(N, E),
            true
        );
        organizerAddresses.push(msg.sender);
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
        candidates.push(Candidate(candidates.length, name));
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
        organizers[organizerAddress] = Organizer(
            name,
            BlindSigKey(N, E),
            true
        );
        organizerAddresses.push(organizerAddress);
    }

    function addVoter(
        address voterAddress,
        string memory name
    )
        public
        onlyOrganizer
    {
        voters[voterAddress] = Voter(
            name,
            uint256(0),
            uint256(0),
            msg.sender,
            true
        );
        voterAddresses.push(voterAddress);
    }

    function requestBlindSig(
        address signer,
        uint256 blinded
    )
        public
        onlyVoter
    {
        require(blindSigRequests[blinded].requester == address(0), "Blind exists");
        blindSigRequests[blinded] = (BlindSigRequest(
            msg.sender,
            signer
        ));
        blinds.push(blinded);
    }

    function signBlindSigRequest(
        address requester,
        uint256 blinded,
        uint256 signed
    )
        public
        onlyOrganizer
    {
        require(blindSigRequests[blinded].requester != address(0), "Blind does not exist");
        voters[requester].signed = signed;
    }

    function vote(
        uint256 voteString,
        uint256 unblinded,
        address signer
    )
        public
    {
        // Make sure voter is not using its registered account
        require(!voters[msg.sender].exists, "Vote sender is registered as voter");

        // Verify voteString with unblinded if its signed by signer
        uint256 message = uint256(keccak256(abi.encode(voteString)));
        uint256 N = organizers[signer].blindSigKey.N;
        uint256 E = organizers[signer].blindSigKey.E;
        require(verifyBlindSig(unblinded, N, E, message), "Blind signature is incorrect");

        // Store the votes
        votes.push(Vote(voteString, unblinded, signer, false));
    }
    // internal
    // private
    function verifyBlindSig(
        uint256 unblinded,
        uint256 N,
        uint256 E,
        uint256 message
    )
        private
        returns (bool)
    {
        uint256 originalMessage = expmod(unblinded, E, N);
        bool result = message == originalMessage;
        return result;
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