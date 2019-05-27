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
    // internal
    // private
}