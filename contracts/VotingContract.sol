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
    // internal
    // private
}