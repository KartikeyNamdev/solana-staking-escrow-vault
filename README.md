# SOLVAULT Backend ⚡️

The backend for SOLVAULT is a TypeScript-powered Express API that serves as the bridge between the frontend and the Solana blockchain.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Blockchain SDK**: `@solana/web3.js`, `@solana/spl-token`
- **Utility**: `dotenv`, `cors`, `nodemon`

## 📡 API Endpoints

| Method | Endpoint                            | Description                                      |
| ------ | ----------------------------------- | ------------------------------------------------ |
| `GET`  | `/`                                 | System status and available modules              |
| `POST` | `/balance`                          | Fetch SOL balance (requires `publicKey` in body) |
| `POST` | `/send`                             | Transfer SOL (requires `reciever`, `amount`)     |
| `POST` | `/createAccount`                    | Generate a new account                           |
| `POST` | `/airdrop`                          | Request airdrop (requires `publicKey`, `amount`) |
| `POST` | `/createToken`                      | Mint a new SPL Token mint                        |
| `POST` | `/getAssociatedTokenAccountAddress` | Resolve ATA for configured tokens                |

## ⚙️ Configuration

Create a `.env` file in the `backend` directory:

```env
PORT=3001
SECRET_KEY_ARRAY=[...your_secret_key_bytes...]
KARTIKEYTOKEN_MINT_ADDRESS=your_token_mint_address
ACCOUNT_1_PUBKEY=your_public_key
```

## 🏗 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## 📝 TODO

- [ ] **Escrow Module**: Implementation of specialized escrow logic.
- [ ] **Vault Module**: Secure storage and withdrawal patterns.
- [ ] **Staking Engine**: Calculating rewards and locking tokens.
- [ ] **Metadata Support**: Adding Metaplex metadata support for token creation.
- [ ] **Error Handling**: Standardized API error responses.
