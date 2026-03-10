// 5MF4QDutGLKRPF5M8VJaasfTRdY7hMzSQ48FdV8JADJW
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

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connection } from "./connection";
import {
  createToken,
  getAssociatedTokenAccountAddress,
  getTokenBalance,
} from "./tokenProgram";
import { createAccount, getBalance, sendSolana } from "./systemProgram";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Solana Application, TODO : Escrow, Vault, Staking");
});

app.get("/balance", async (req, res) => {
  if (!req.body.publicKey) {
    return res.json({ error: "Public key is required" });
  }
  try {
    const balance = await getBalance(new PublicKey(req.body.publicKey));
    return res.json({ balance });
  } catch (e) {
    return res.json({ error: "Public key is invalid" });
  }
});
// transfer
app.post("/send", async (req, res) => {
  const { reciever, amount } = req.body;
  if (reciever === undefined || amount === undefined) {
    return res.json({ error: "Reciever and amount are required" });
  }
  try {
    const signature = await sendSolana({
      reciever: new PublicKey(reciever),
      amount,
    });
    return res.json({ signature });
  } catch (e) {
    console.log(e);
    return res.json({ error: "Something went wrong" });
  }
});

// Get balance => getBalance(new PublicKey("5MF4QDutGLKRPF5M8VJaasfTRdY7hMzSQ48FdV8JADJW"));

// create account
app.post("/createAccount", async (req, res) => {
  try {
    const signature = await createAccount();
    res.json({ signature });
  } catch (e) {
    console.log(e);
    return res.json({ error: "Something went wrong" });
  }
});

app.post("/airdrop", async (req, res) => {
  const { publicKey, amount } = req.body;
  console.log("You hit the airdrop endpoint");
  if (!publicKey || !amount) {
    return res.json({
      error: "Public key and amount are required",
    });
  }

  try {
    console.log("Initiating Airdrop");
    const airdropSignature = await connection.requestAirdrop(
      new PublicKey(publicKey),
      LAMPORTS_PER_SOL * amount,
    );
    console.log("Started");
    await connection.confirmTransaction(airdropSignature);
    console.log("Confirmed");
    return res.json({ signature: airdropSignature });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: "Airdrop failed",
      message: e instanceof Error ? e.message : "Internal error",
    });
  }
});
app.post("/createToken", async (req, res) => {
  try {
    const signature = await createToken();
    res.json({ signature });
  } catch (e) {
    console.log(e);
    return res.json({ error: "Something went wrong" });
  }
});
app.post("/getAssociatedTokenAccountAddress", async (req, res) => {
  try {
    const { mintAddress, publicKey } = await req.body;
    const address = await getAssociatedTokenAccountAddress(
      mintAddress,
      publicKey,
    );
    res.json({ address });
  } catch (e) {
    console.log(e);
    return res.json({ error: "Something went wrong" });
  }
});
app.post("/getTokenBalance", async (req, res) => {
  try {
    const { mintAddress, publicKey } = await req.body;
    const balance = await getTokenBalance(mintAddress, publicKey);
    res.json({
      message: balance,
    });
  } catch (e) {
    res.json({
      message: e,
    });
  }
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
