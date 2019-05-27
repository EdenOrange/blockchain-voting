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

    // Events

    // Functions
    constructor() public {
        state = State.Preparation;
    }
    // fallback function (if exists)
    // external
    // public
    // internal
    // private
}