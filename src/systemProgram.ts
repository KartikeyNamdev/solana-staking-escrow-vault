import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { connection } from "./connection";

export const getBalance = async (publicKey: PublicKey) => {
  const balance = await connection.getBalance(publicKey);
  console.log(balance);
  return balance;
};
export const prepareSendSolana = async ({
  reciever,
  amount,
  sender,
}: {
  reciever: PublicKey;
  amount: number;
  sender: PublicKey;
}) => {
  try {
    const txn = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: reciever,
        lamports: Math.floor(LAMPORTS_PER_SOL * amount),
      }),
    );
    // 3uhG7Sx5rSF52W5t9MKHR4wjk7CYtmJtdib3p3nWeQpMxxzndMNXFRfDidCX75nVcc8U33g6vqS72szVRKfhgbFv

    const { blockhash } = await connection.getLatestBlockhash();
    txn.recentBlockhash = blockhash;
    txn.feePayer = sender;

    const serializedTransaction = txn
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");
    console.log(serializedTransaction);
    return { transaction: serializedTransaction };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const prepareCreateAccount = async (payer: PublicKey) => {
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
      }),
    );

    const { blockhash } = await connection.getLatestBlockhash();
    txn.recentBlockhash = blockhash;
    txn.feePayer = payer;

    // We partial sign with the new account keypair since we generated it
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
    console.error(e);
    throw e;
  }
};
