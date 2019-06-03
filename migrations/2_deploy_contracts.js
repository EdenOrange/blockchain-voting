const VotingContract = artifacts.require("VotingContract");

module.exports = function(deployer) {
  const name = "Organizer 0";
  const N = "76371029918972468664941514738317813949700823831516674062130698696256739747471";
  const E = "65537";
  const endPreparationTimestamp = "1";
  const endRegistrationTimestamp = "2";
  const endVotingTimestamp = "3";

  deployer.deploy(
    VotingContract,
    name,
    N,
    E,
    endPreparationTimestamp,
    endRegistrationTimestamp,
    endVotingTimestamp
  );
}