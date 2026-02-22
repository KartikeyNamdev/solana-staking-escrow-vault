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
import dotenv from "dotenv";
import { createAccount, getBalance, sendSolana } from "./systemProgram";
dotenv.config();
const app = express();

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

app.post("/createAccount", async (req, res) => {
  try {
    const signature = await createAccount();
    res.json({ signature });
  } catch (e) {
    console.log(e);
    return res.json({ error: "Something went wrong" });
  }
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
