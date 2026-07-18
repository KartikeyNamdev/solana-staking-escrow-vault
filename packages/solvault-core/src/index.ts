import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getAccount,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token";

// Default connection fallback
export const getDefaultConnection = (network: "devnet" | "testnet" | "mainnet-beta" = "devnet") => {
  return new Connection(clusterApiUrl(network), "confirmed");
};

/**
 * Fetch SOL balance for a given public key
 */
export const getBalance = async (connection: Connection, publicKey: PublicKey): Promise<number> => {
  return await connection.getBalance(publicKey);
};

/**
 * Prepare a serialized transaction to send SOL from sender to receiver
 */
export const prepareSendSolana = async (
  connection: Connection,
  {
    sender,
    receiver,
    amount
  }: {
    sender: PublicKey;
    receiver: PublicKey;
    amount: number;
  }
): Promise<{ transaction: string }> => {
  try {
    const txn = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: receiver,
        lamports: Math.floor(LAMPORTS_PER_SOL * amount),
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    txn.recentBlockhash = blockhash;
    txn.feePayer = sender;

    const serializedTransaction = txn
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");

    return { transaction: serializedTransaction };
  } catch (e) {
    console.error("Error preparing send Solana transaction:", e);
    throw e;
  }
};

/**
 * Prepare a serialized transaction to create a new system account
 */
export const prepareCreateAccount = async (
  connection: Connection,
  payer: PublicKey
): Promise<{ transaction: string; newAccount: string }> => {
  try {
    const newAccountId = Keypair.generate();
    const lamports = await connection.getMinimumBalanceForRentExemption(0);

    const txn = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: newAccountId.publicKey,
        lamports: lamports,
        space: 0,
        programId: SystemProgram.programId,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    txn.recentBlockhash = blockhash;
    txn.feePayer = payer;

    // Partial sign with the new account's generated keypair
    txn.partialSign(newAccountId);

    const serializedTransaction = txn
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");

    return {
      transaction: serializedTransaction,
      newAccount: newAccountId.publicKey.toBase58(),
    };
  } catch (e) {
    console.error("Error preparing create account transaction:", e);
    throw e;
  }
};

/**
 * Prepare a serialized transaction to initialize an SPL Token-2022 mint
 */
export const prepareCreateToken = async (
  connection: Connection,
  payer: PublicKey
): Promise<{ transaction: string; mint: string }> => {
  try {
    const mintKeypair = Keypair.generate();
    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

    const txn = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        6, // decimals
        payer, // mint authority
        null, // freeze authority
        TOKEN_2022_PROGRAM_ID
      )
    );

    const { blockhash } = await connection.getLatestBlockhash();
    txn.recentBlockhash = blockhash;
    txn.feePayer = payer;

    // Partial sign with the mint keypair
    txn.partialSign(mintKeypair);

    const serializedTransaction = txn
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");

    return {
      transaction: serializedTransaction,
      mint: mintKeypair.publicKey.toBase58(),
    };
  } catch (e) {
    console.error("Error preparing create token transaction:", e);
    throw e;
  }
};

/**
 * Resolve Associated Token Account (ATA) address for Token-2022 standard
 */
export const getAssociatedTokenAccountAddress = async (
  mintAddress: string | PublicKey,
  ownerAddress: string | PublicKey
): Promise<PublicKey> => {
  const mint = typeof mintAddress === "string" ? new PublicKey(mintAddress) : mintAddress;
  const owner = typeof ownerAddress === "string" ? new PublicKey(ownerAddress) : ownerAddress;
  
  return await getAssociatedTokenAddress(
    mint,
    owner,
    false,
    TOKEN_2022_PROGRAM_ID
  );
};

/**
 * Fetch token balance for a given mint and owner address
 */
export const getTokenBalance = async (
  connection: Connection,
  mintAddress: string | PublicKey,
  ownerAddress: string | PublicKey
): Promise<string | null> => {
  try {
    const address = await getAssociatedTokenAccountAddress(mintAddress, ownerAddress);
    const account = await getAccount(
      connection,
      address,
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );
    return account.amount.toString();
  } catch (e) {
    console.error("Error fetching token balance:", e);
    return null;
  }
};
