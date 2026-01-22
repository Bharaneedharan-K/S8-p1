# How to Run the Blockchain Network

This guide explains how to start the local Ethereum network, deploy the smart contract, and connect your wallet.

## Prerequisites
- Node.js installed
- MetaMask Browser Extension installed

## Step 1: Start the Local Blockchain Node
This commands starts a local Ethereum network (Hardhat Network) on your machine.
1. Open a terminal in the `blockchain` folder.
2. Run the following command:
   ```bash
   npx hardhat node
   ```
3. **KEEP THIS TERMINAL OPEN.** You will see a list of "Accounts" and "Private Keys". You will need these later.

## Step 2: Deploy the Smart Contract
This command compiles your Solidity code and puts it on your local network.
1. Open a **SECOND** terminal in the `blockchain` folder.
2. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
3. You should see a message: `LandRegistry deployed to: 0x...`
4. This script also auto-updates the frontend with the new address.

## Step 3: Connect MetaMask to Localhost
1. Open MetaMask.
2. Click the network dropdown (usually top-left) -> **Add Network**.
3. Choose **"Add a network manually"** at the bottom.
4. Fill in these details:
   - **Network Name**: Localhost 8545
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: ETH
5. Click **Save**.

## Step 4: Import Test Account (Get Free ETH)
1. Go back to the **First Terminal** (where `npx hardhat node` is running).
2. Scroll up to see the list of accounts.
3. Copy the **Private Key** of Account #0 (starts with `0x...`).
4. In MetaMask:
   - Click the generic profile icon (top-right circle).
   - Click **Import Account**.
   - Paste the private key.
   - Click **Import**.
5. You should now see **10000 ETH** in your balance.

## Step 5: Run the App
Now you can go to the **Admin Dashboard** -> **Verify Land** and click "Verify & Mint". MetaMask will pop up asking you to sign the transaction!
