# @solvault/core

Core non-custodial web3 library and transaction builder utilities for the **SOLVAULT** developer toolbox. 

This package extracts all Solana blockchain interaction, RPC connections, and SPL Token-2022 transaction builders into a pure, library-grade TypeScript module. It contains zero UI dependencies, making it clean, lightweight, and installable in any Node/Browser project.

---

## Installation

```bash
npm install @solvault/core
```

---

## Quickstart

```typescript
import { Connection, PublicKey } from "@solana/web3.js";
import { 
  getDefaultConnection, 
  getAssociatedTokenAccountAddress, 
  prepareCreateToken 
} from "@solvault/core";

// 1. Initialize connection
const connection = getDefaultConnection("devnet");

// 2. Resolve an Associated Token Account address (Token-2022)
const mintAddress = new PublicKey("5MF4QDutGLKRPF5M8VJaasfTRdY7hMzSQ48FdV8JADJW");
const ownerAddress = new PublicKey("3uhG7Sx5rSF52W5t9MKHR4wjk7CYtmJtdib3p3nWeQpMxxzndMNXFRfDidCX75nVcc8U33g6vqS72szVRKfhgbFv");

const ataAddress = await getAssociatedTokenAccountAddress(mintAddress, ownerAddress);
console.log("ATA Address:", ataAddress.toBase58());

// 3. Prepare a serialized Transaction to initialize a token mint
const payerAddress = ownerAddress;
const { transaction, mint } = await prepareCreateToken(connection, payerAddress);

console.log("New Mint Public Key:", mint);
// Send 'transaction' (base64 string) to the frontend wallet-adapter to sign and broadcast!
```

---

## Architecture: Non-Custodial Wallet-Auth State Machine

SOLVAULT uses a hybrid architecture that keeps users in absolute control of their private keys while decoupling transaction composition from signing:

```text
+-----------------------+              +-----------------------+              +-----------------------+
|  Backend API Server   |              |   Browser Dashboard   |              |  User Solana Wallet   |
|   (@solvault/core)    |              |  (Next.js Front-End)  |              |   (Phantom, Solflare) |
+-----------+-----------+              +-----------+-----------+              +-----------+-----------+
            |                                      |                                      |
            |  1. Request tx to mint SPL token    |                                      |
            |<-------------------------------------|                                      |
            |                                      |                                      |
            |  2. Generate new Mint keypair        |                                      |
            |     Build SystemProgram tx           |                                      |
            |     Partial sign with Mint keypair   |                                      |
            |     Serialize as base64              |                                      |
            |------------------------------------->|                                      |
            |                                      |                                      |
            |                                      |  3. Deserialize base64 transaction   |
            |                                      |  4. Request wallet signature         |
            |                                      |------------------------------------->|
            |                                      |                                      |
            |                                      |                                      |  5. Approve and sign
            |                                      |                                      |  6. Broadcast to cluster
            |                                      |                                      |<----------------------|
            |                                      |  7. Return transaction signature     |
            |                                      |<-------------------------------------|
            |                                      |                                      |
```

### Decoupled State Machine Operations
1. **Payer Autonomy**: The server compiles and partially signs the transaction (e.g. validating rent exemptions and program instructions) but cannot finalize it because only the user holds the authority signature.
2. **Transaction Serialization**: Transactions are serialized to base64, crossing process boundaries safely.
3. **Wallet Adapter Verification**: The browser-level wallet adapter prompts the user to sign. Once signed, the transaction is broadcasted to the Solana cluster, verifying the state on-chain.
