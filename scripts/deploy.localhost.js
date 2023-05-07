const { deployments } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy('MyContract', {
    from: deployer,
    args: [1000],
    log: true,
  });
};