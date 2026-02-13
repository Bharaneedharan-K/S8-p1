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
        // Trying to read the land mentioned in the error: SR-2324-2K (Hex decoded from user error: a53522d323332342d324b)
        // Wait, the error data "a53522d...24b" ends with 4b which is 'K'. 
        // 53 52 2d 32 33 32 34 2d 32 4b -> SR-2324-2K
        const data = await contract.getLand('SR-2324-2K');
        console.log('Land Found:', data);
    } catch (e) {
        console.log('Land NOT found (This is GOOD for registration):', e.message);
    }
};

main();
