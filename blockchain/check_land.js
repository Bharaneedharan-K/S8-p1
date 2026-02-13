const { ethers } = require('ethers');

const main = async () => {
    // Connect to Amoy
    const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology/');

    // Check Contract Code first
    const code = await provider.getCode('0x180845C148eb4fA5a84D362AD2d6e2Cc1AaA36E4');
    if (code === '0x') {
        console.log('ERROR: No contract code at given address!');
        return;
    }
    console.log('Contract found. Checking Land...');

    const contract = new ethers.Contract(
        '0x180845C148eb4fA5a84D362AD2d6e2Cc1AaA36E4',
        ['function getLand(string) view returns (uint256,string,string,address,uint256)'],
        provider
    );

    try {
        // Trying to read the land mentioned in the error: SR-2324-6C
        const data = await contract.getLand('SR-2324-6C');
        console.log('Land Found:', data);
    } catch (e) {
        console.log('Land NOT found (This is GOOD for registration):', e.message);
    }
};

main();
