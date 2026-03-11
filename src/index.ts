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

import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connection } from "./connection";
import {
  getAssociatedTokenAccountAddress,
  getTokenBalance,
  prepareCreateToken,
} from "./tokenProgram";
import {
  getBalance,
  prepareCreateAccount,
  prepareSendSolana,
} from "./systemProgram";
dotenv.config();
const app = express();

const FRONTEND_URL: string = process.env.FRONTEND_URL || "*";

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Solana Application, TODO : Escrow, Vault, Staking");
});

app.post("/balance", async (req: Request, res: Response) => {
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

// transfer (prepare transaction)
app.post("/send", async (req: Request, res: Response) => {
  const { sender, reciever, amount } = req.body;
  if (!sender || !reciever || amount === undefined) {
    return res.json({ error: "Sender, reciever and amount are required" });
  }
  try {
    const data = await prepareSendSolana({
      sender: new PublicKey(sender),
      reciever: new PublicKey(reciever),
      amount: parseFloat(amount),
    });
    return res.json(data);
  } catch (e) {
    console.log(e);
    return res.json({ error: "Something went wrong" });
  }
});

// create account (prepare transaction)
app.post("/createAccount", async (req: Request, res: Response) => {
  const { payer } = req.body;
  if (!payer) {
    return res.json({ error: "Payer is required" });
  }
  try {
    const data = await prepareCreateAccount(new PublicKey(payer));
    res.json(data);
  } catch (e) {
    console.log(e);
    return res.json({ error: "Something went wrong" });
  }
});

app.post("/airdrop", async (req: Request, res: Response) => {
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

app.post("/createToken", async (req: Request, res: Response) => {
  const { payer } = req.body;
  if (!payer) {
    return res.json({ error: "Payer is required" });
  }
  try {
    const data = await prepareCreateToken(new PublicKey(payer));
    res.json(data);
  } catch (e) {
    console.log(e);
    return res.json({ error: "Something went wrong" });
  }
});
app.post(
  "/getAssociatedTokenAccountAddress",
  async (req: Request, res: Response) => {
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
  },
);
app.post("/getTokenBalance", async (req: Request, res: Response) => {
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
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
