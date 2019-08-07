const VotingContract = artifacts.require("VotingContract");

module.exports = function(deployer) {
  const name = "Organizer 1";
  const N = "66655563862723763847474202717193239571546330570097639914700288437768035973357";
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