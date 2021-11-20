async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const compoundBorrow = await ethers.getContractFactory("CompoundBorrow");
  const compoundSupply = await ethers.getContractFactory("CompoundSupply");

  const contractBorrow = await compoundBorrow.deploy();
  const contractSupply = await compoundSupply.deploy();

  console.log("Contract CompoundBorrow address:", contractBorrow.address);
  console.log("Contract CompoundSupply address:", contractSupply.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });