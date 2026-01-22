const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying LandRegistry contract...");

    const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
    const landRegistry = await LandRegistry.deploy();

    await landRegistry.waitForDeployment();

    const address = await landRegistry.getAddress();
    console.log("LandRegistry deployed to:", address);

    // Save ABI and Address to Client
    const artifact = artifacts.readArtifactSync("LandRegistry");
    const contractData = {
        address: address,
        abi: artifact.abi
    };

    const clientDir = path.join(__dirname, "../../client/src/blockchain");
    if (!fs.existsSync(clientDir)) {
        fs.mkdirSync(clientDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(clientDir, "LandRegistry.json"),
        JSON.stringify(contractData, null, 2)
    );

    console.log("Artifacts saved to client/src/blockchain/LandRegistry.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
