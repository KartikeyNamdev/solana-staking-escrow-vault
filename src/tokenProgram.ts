import { Keypair, PublicKey } from "@solana/web3.js";
import { connection } from "./connection";
import {
  createMint,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
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

export const getAssociatedTokenAccountAddress = async () => {
  try {
    const address = await getAssociatedTokenAddress(
      new PublicKey(process.env.KARTIKEYTOKEN_MINT_ADDRESS!),
      new PublicKey(process.env.ACCOUNT_1_PUBKEY!),
    );
    console.log(address.toBase58());
    return address.toBase58();
  } catch (e) {
    console.log(e);
    return null;
  }
};
