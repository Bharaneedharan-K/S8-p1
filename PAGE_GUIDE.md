# 🧭 Application Page Guide & User Manual

This document provides a detailed explanation of every page in the application, including its purpose, features, and available actions.

---

## 🌍 Public Zone
*Accessible to all users (No Login Required)*

### 1. Landing Page (`/`)
**Purpose**: The public face of the portal and the entry point for the "Trustless Audit".
-   **Public Verification Tool**: A search bar where anyone (buyers, auditors, citizens) can enter a **Survey Number**.
    -   *Logic*: The system fetches data from the **Database** AND the **Blockchain**, recalculates the hash locally, and compares them.
    -   *Result*: Displays **✅ VERIFIED** if matches, or **❌ TAMPER DETECTED** if data was altered.
-   **Features**: Project overview, key benefits (Tamper Proof, Instant Verification), and Login/Register links.

### 2. Login Page (`/login`)
**Purpose**: Secure entry point for all three roles (Farmer, Officer, Admin).
-   **Features**: Email/Password authentication.
-   **Logic**: Automatically redirects the user to their specific Dashboard (`/dashboard`) based on their role.

### 3. Registration Page (`/register`)
**Purpose**: Sign-up form for new **Farmers** only.
-   **Inputs**: Name, Email, Mobile, Password, District.
-   **Note**: Land Officers and Admins cannot register here; they must be created by an Administrator.

---

## 👨‍🌾 Farmer Zone
*Role: `FARMER` | Goal: Manage Identity and Benefits*

### 4. Farmer Dashboard (`/dashboard`)
**Purpose**: The central command center for the farmer.
-   **Status Banner**: Shows if the account is **Pending**, **Verified**, or **Rejected**.
-   **Quick Stats**: Displays assigned District, Mobile Number, and current Status.
-   **Quick Links**: Shortcuts to "Land Records" and "Government Schemes" (Grayed out if not verified).

### 5. Verify Identity (`/farmer/verify`)
**Purpose**: The first step for a new farmer to unlock features.
-   **Actions**:
    -   Upload **Aadhaar Card** (Image/PDF).
    -   Upload **Selfie** (Image).
-   **Outcome**: Submits the profile to the **District Land Officer** for review. Status changes to "Pending Verification".

### 6. My Profile (`/farmer/profile`)
**Purpose**: View personal details and farming statistics.
-   **Data Displayed**: Name, District, Mobile, Email, Account Status.
-   **Live Stats**:
    -   Total Lands Owned.
    -   Total Acreage (Acres).
    -   Number of Active Schemes applied for.

### 7. My Land Records (`/farmer/lands`)
**Purpose**: Digital portfolio of verified land ownership.
-   **Table Data**: Survey Number, Area, District, Land Type (Agri/Commercial), Status.
-   **Blockchain Proof**: If verified, shows the **Blockchain Hash** and a link to the **Transaction Hash**.

### 8. Government Schemes (`/farmer/schemes`)
**Purpose**: Marketplace of available welfare schemes (e.g., PM-KISAN, Fertilizer Subsidy).
-   **Features**:
    -   View Scheme details (Benefit Amount, Eligibility).
    -   **"Apply" Button**: One-click application (automatically links your verified land data).

### 9. My Applications (`/farmer/applications`)
**Purpose**: Track the lifecycle of scheme applications.
-   **Status Tracking**: Shows if an application is **Pending**, **Approved**, or **Rejected** by the Admin.

---

## 👮‍♂️ Land Officer Zone
*Role: `OFFICER` | Goal: Verify Data on the Ground*

### 10. Officer Dashboard (`/dashboard`)
**Purpose**: Operational view for the assigned District.
-   **Metrics**: Pending Tasks, Verified Farmers, Total Land Records in District.
-   **Action Center**: Quick buttons to "Verify Farmers", "Add Land", or "View Records".

### 11. Verify Farmers (`/officer/farmers`)
**Purpose**: Review identity documents submitted by new farmers.
-   **Workflow**:
    1.  View list of "Pending" farmers.
    2.  Click to see **Aadhaar** and **Selfie**.
    3.  **Action**: "Approve" (unlocks farmer access) or "Reject" (with reason).

### 12. Add Land Record (`/officer/add-land`)
**Purpose**: The entry point for digitizing a land record.
-   **Step 1: Farmer Search**: Enter email to find and verify the owner exists in the system.
-   **Step 2: Land Details**: Enter Survey Number, Area, Address, Land Type.
-   **Step 3: Document Upload**: Upload the physical land deed (PDF/Image).
-   **Outcome**: Creates a "Pending Land Record" sent to the Admin for final Minting.

### 13. District Lands (`/officer/lands`)
**Purpose**: Read-only view of all land records in the officer's district.
-   **Filter**: View Pending vs. Approved lands.
-   **Use Case**: Check the status of records submitted earlier.

---

## 🏛️ Administrator Zone
*Role: `ADMIN` | Goal: Governance & Blockchain Minting*

### 14. Admin Dashboard (`/dashboard`)
**Purpose**: System-wide health monitor.
-   **Global Stats**: Total Users, Total Lands Minted, Total Schemes Active.
-   **Navigation Grid**: Access to all management modules.

### 15. Manage Users (`/admin/farmers`, `/admin/officers`)
**Purpose**: User management.
-   **Create Officer**: Form to register a new Officer and assign them to a district.
-   **User List**: View database of all registered users.

### 16. Verify & Mint Land (`/admin/verify-land`)
**Purpose**: The **Critical** step where data moves from Database to Blockchain.
-   **Workflow**:
    1.  View "Pending" lands submitted by Officers.
    2.  Review details (Owner, Area, Document).
    3.  **Action**: Click **"Verify & Mint"**.
    4.  **Blockchain Event**: Wallet popup (MetaMask) asks to sign the transaction -> Writes Hash to Ethereum -> Updates DB to "Approved".

### 17. Manage Schemes (`/admin/schemes`)
**Purpose**: Create and manage welfare programs.
-   **Action**: "Create New Scheme" (Name, Description, Amount, Criteria).
-   **Edit/Delete**: Modify existing active schemes.

### 18. Review Applications (`/admin/applications`)
**Purpose**: Approve/Reject farmer applications for schemes.
-   **Data**: Shows Farmer Name, Land Details, and the Scheme applied for.
-   **Action**: Approve (Disburse funds) or Reject.

### 19. Blockchain Audit Logs (`/admin/logs`)
**Purpose**: A technical "Truth Layer" for auditing.
-   **Real-Time Feed**: Connects directly to the **Smart Contract**.
-   **Data Displayed**:
    -   **Timestamp**: When the block was mined.
    -   **Survey No**: The unique identifier (or its hash).
    -   **Land Hash**: The SHA-256 fingerprint of the record.
    -   **Transaction Hash**: The immutable link to the Ethereum transaction.
