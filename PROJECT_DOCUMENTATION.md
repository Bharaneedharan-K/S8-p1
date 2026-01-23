# 🌾 Blockchain-Based Land Registry & Farmer Scheme Portal

## 1. About the Project
This project is a decentralized, transparent, and secure Web3 application designed to modernize Land Record Management and Farmer Welfare Schemes in India. By leveraging **Blockchain Technology (Ethereum)**, we eliminate land fraud, ensure immutable ownership records, and streamline government benefit distribution.

The system connects three key stakeholders—**Farmers, Government Officers, and Admins**—into a single trustless platform where data integrity is guaranteed by smart contracts.

## 2. Key Problem Solved
- **❌ Land Fraud**: Traditional paper/database records can be tampered with or destroyed.
- **❌ Double Spending**: Selling the same land to multiple people.
- **❌ Bureaucracy**: Slow approval processes for land registration and schemes.
- **❌ Lack of Transparency**: Public cannot easily verify land ownership history.

**✅ Our Solution**: A Hybrid System where metadata lives in a fast database (MongoDB) but the **"Truth" (Ownership Hash)** is permanently written to the Public Blockchain.

---

## 3. Core Use Cases

### 👨‍🌾 For Farmers
1.  **Digital Identity**: Verified account linked to Aadhaar/Mobile.
2.  **Land Portfolio**: View all owned lands with cryptographic proof.
3.  **Scheme Application**: One-click apply for government subsidies (e.g., PM-KISAN) based on verified land data.
4.  **Status Tracking**: Real-time updates on land verification and scheme approval.

### 👮‍♂️ For Land Officers
1.  **Digital Verification**: Verify physical documents uploaded by farmers.
2.  **On-Ground Check**: Approve/Reject land claims from the dashboard.
3.  **Fraud Prevention**: System alerts if Survey Number already exists.

### 🏛️ For Administrators
1.  **Minting to Blockchain**: The final step where approved land is "minted" as a permanent record on Ethereum.
2.  **Audit Trail**: View a live feed of all blockchain transactions.
3.  **Scheme Management**: Create and launch new welfare schemes dynamically.

### 🔍 For Public / Auditors
1.  **Public Verification**: Anyone can enter a **Survey Number** on the landing page to instantly check if a land record is valid or tampered with.

---

## 4. System Flow & How It Works

### Phase 1: Registration & Identity
1.  Farmer registers on the portal.
2.  Officer verifies the Farmer's identity (KYC).
3.  Farmer gets access to the dashboard.

### Phase 2: Land Registration (The "Minting" Flow)
1.  **Submission**: Farmer/Officer submits land details (Survey No, Area, Documents).
2.  **Verification**: Officer reviews the uploaded documents.
3.  **Approval & Hashing**: Admin approves the record.
    - The system generates a **SHA-256 Hash** of the data (SurveyNo + Owner + Area).
4.  **Blockchain Write**: This Hash is sent to the **Smart Contract (`LandRegistry.sol`)**.
5.  **Immutability**: The Blockchain returns a Transaction Hash (`0x...`). This is saved in the database. The record is now **Immutable**.

### Phase 3: Public Audit (The "Trust" Flow)
1.  A buyer/auditor visits the **Landing Page**.
2.  Enters a Survey Number.
3.  **Dual Check System**:
    - The app fetches data from the **Database**.
    - The app fetches data from the **Blockchain**.
    - It recalculates the hash locally.
4.  **Result**:
    - If `DB Hash == Blockchain Hash`: **✅ VERIFIED SECURE**
    - If mismatch: **❌ TAMPER DETECTED**

---

## 5. Technology Stack

### Frontend
- **React.js + Vite**: Fast, modern UI.
- **Tailwind CSS**: Professional, responsive styling.
- **Ethers.js**: To communicate with the Ethereum Blockchain.

### Backend
- **Node.js + Express**: REST API for managing users, schemes, and temp data.
- **MongoDB**: Stores user profiles, scheme applications, and land metadata.

### Blockchain
- **Solidity**: Smart Contract language.
- **Hardhat**: Local Ethereum development environment.
- **Smart Contract**: Stores `(SurveyNumber => Owner, Hash, Timestamp)`.

---

## 6. Directory Structure
```
📂 Project Root
├── 📂 blockchain       # Hardhat project (Contracts, Tests, Scripts)
│   └── 📄 LandRegistry.sol
├── 📂 client           # React Frontend
│   └── 📂 src
│       ├── 📂 pages    # Dashboard, Landing, Profile, Audit Logs
│       └── 📂 blockchain # Artifacts (ABIs)
└── 📂 server           # Node.js Backend
    ├── 📂 controllers  # Business Logic
    └── 📂 models       # MongoDB Schemas
```
