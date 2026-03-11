import {
  createInitializeMintInstruction,
  getAccount,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import dotenv from "dotenv";
import { connection } from "./connection";
dotenv.config();

export const prepareCreateToken = async (payer: PublicKey) => {
  try {
    const mintKeypair = Keypair.generate();
    const lamports =
      await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

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
        6,
        payer,
        null,
        TOKEN_2022_PROGRAM_ID,
      ),
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
    console.error(e);
    throw e;
  }
};

export const getAssociatedTokenAccountAddress = async (
  mintAddress: string,
  publicKey: string,
) => {
  try {
    const address = await getAssociatedTokenAddress(
      new PublicKey(mintAddress),
      new PublicKey(publicKey),
    );
    console.log(address.toBase58());
    return address;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export async function getTokenBalance(mintAddress: string, publicKey: string) {
  try {
    const address = await getAssociatedTokenAddress(
      new PublicKey(mintAddress),
      new PublicKey(publicKey),
      false,
      TOKEN_2022_PROGRAM_ID,
    );

    const account = await getAccount(
      connection,
      address,
      "confirmed",
      TOKEN_2022_PROGRAM_ID,
    );
    console.log("Account :", account);
    console.log("Balance:", account.amount.toString());

    return account.amount.toString();
  } catch (e) {
    console.log(e);
    return null;
  }
}
