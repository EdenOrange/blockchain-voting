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
    }
    mapping(address => Voter) voters;
    address[] public voterAddresses;

    struct BlindSigRequest {
        address requester;
        address signer;
    }
    mapping(uint256 => BlindSigRequest) blindSigRequests;
    uint256[] blinds;

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
            msg.sender
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
    // internal
    // private
}