import { test, describe } from "node:test";
import assert from "node:assert";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { 
  getDefaultConnection, 
  prepareSendSolana, 
  prepareCreateAccount, 
  prepareCreateToken,
  getAssociatedTokenAccountAddress 
} from "./index.js";

describe("Solvault Core Utilities", () => {
  const connection = getDefaultConnection("devnet");
  const senderKeypair = Keypair.generate();
  const receiverKeypair = Keypair.generate();

  test("Connection initialization works", () => {
    assert.ok(connection instanceof Connection);
    assert.strictEqual(connection.rpcEndpoint.includes("devnet"), true);
  });

  test("getAssociatedTokenAccountAddress computes correctly", async () => {
    const mint = Keypair.generate().publicKey;
    const owner = Keypair.generate().publicKey;
    const address = await getAssociatedTokenAccountAddress(mint, owner);
    
    assert.ok(address instanceof PublicKey);
    assert.strictEqual(PublicKey.isOnCurve(address.toBuffer()), false);
  });

  test("prepareSendSolana generates a valid transaction envelope", async () => {
    const res = await prepareSendSolana(connection, {
      sender: senderKeypair.publicKey,
      receiver: receiverKeypair.publicKey,
      amount: 0.1
    });

    assert.ok(res.transaction);
    assert.strictEqual(typeof res.transaction, "string");
    // Verify base64
    assert.doesNotThrow(() => Buffer.from(res.transaction, "base64"));
  });

  test("prepareCreateAccount generates a valid transaction envelope and new keypair", async () => {
    const res = await prepareCreateAccount(connection, senderKeypair.publicKey);

    assert.ok(res.transaction);
    assert.ok(res.newAccount);
    assert.strictEqual(typeof res.transaction, "string");
    assert.strictEqual(typeof res.newAccount, "string");
    assert.doesNotThrow(() => new PublicKey(res.newAccount));
  });

  test("prepareCreateToken generates a valid transaction envelope and mint keypair", async () => {
    const res = await prepareCreateToken(connection, senderKeypair.publicKey);

    assert.ok(res.transaction);
    assert.ok(res.mint);
    assert.strictEqual(typeof res.transaction, "string");
    assert.strictEqual(typeof res.mint, "string");
    assert.doesNotThrow(() => new PublicKey(res.mint));
  });
});
