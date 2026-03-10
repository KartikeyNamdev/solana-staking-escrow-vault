import { Keypair, PublicKey } from "@solana/web3.js";
import { connection } from "./connection";
import {
  createMint,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import dotenv from "dotenv";
dotenv.config();
export const createToken = async () => {
  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.SECRET_KEY_ARRAY || "[]")),
  );
  const mintAuthority = payer;
  const mint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    null,
    6,
  );
  console.log("Mint address : ", mint.toBase58());
  return mint;
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
