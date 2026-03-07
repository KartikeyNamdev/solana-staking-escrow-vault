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
// sendSolana({
//   reciever: new PublicKey("9Joe1dtfQHD7yE159ckPWm9vYSLYfv3JCpfjT19ozkof"),
//   amount: 0.1,
// });
export const sendSolana = async ({
  reciever,
  amount,
}: {
  reciever: PublicKey;
  amount: number;
}) => {
  const secretKeyArray = JSON.parse(process.env.SECRET_KEY_ARRAY || "[]");
  const Sender = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
  console.log(
    "Sender ( public key ) extracted from secret key ",
    Sender.publicKey.toBase58(),
  );
  try {
    const txn = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: Sender.publicKey,
        toPubkey: reciever,
        lamports: LAMPORTS_PER_SOL * amount,
      }),
    );

    const signature = await sendAndConfirmTransaction(connection, txn, [
      Sender,
    ]);
    return signature;
  } catch (e) {
    console.log(e);
    return "Something went wrong";
  }
};
export const createAccount = async () => {
  // who will pay for this account
  try {
    const secretKeyArray = JSON.parse(process.env.SECRET_KEY_ARRAY || "[]");
    if (!secretKeyArray) {
      return "Secret key not found";
    }
    const payer = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));

    // which account will be created
    const newAccountId = Keypair.generate();
    const txn = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: newAccountId.publicKey, // Generated before
        lamports: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL
        space: 0,
        programId: SystemProgram.programId, // Ownership
      }),
    );
    const response = await sendAndConfirmTransaction(connection, txn, [
      payer,
      newAccountId,
    ]);
    return { response, newAccountId: newAccountId.publicKey.toBase58() };
  } catch (e) {
    console.log(e);
    return e;
  }
};
