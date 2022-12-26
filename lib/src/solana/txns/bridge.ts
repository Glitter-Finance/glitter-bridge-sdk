
import { BridgeToken, Routing, ValueUnits } from "glitter-bridge-common-dev";
import * as util from "util";
import { serialize } from "borsh";
import algosdk from "algosdk";
import { SolanaAccount, SolanaAccounts } from '../accounts';
import * as solanaWeb3 from "@solana/web3.js";

import {
    clusterApiUrl,
    Connection,
    PublicKey,
    SystemProgram,
    sendAndConfirmTransaction,
    Keypair,
    Transaction,
    TransactionInstruction,
  } from "@solana/web3.js";
  import {
    getMint,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getOrCreateAssociatedTokenAccount,
    TOKEN_PROGRAM_ID,
  } from "@solana/spl-token";
  import * as splToken from "@solana/spl-token";
import { DepositNote } from "../utils";

export class SolanaBridgeTxnsV1 {

    private _bridgeProgramAddress: string | undefined = undefined;
    private _primarySeed: string = "glitter";
    private _client?: Connection;

    //Setters
    public constructor(client: Connection, bridgeProgramAddress: string) {
        this._client = client;
        this._bridgeProgramAddress = bridgeProgramAddress;
    }

    public async getSolEscrowAccount(account: PublicKey): Promise<PublicKey> {
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._bridgeProgramAddress) throw new Error("Bridge Program Address is not set");

                //Get Bridge Program PubKey
                const bridgeProgram = new PublicKey(this._bridgeProgramAddress!);

                //Get Bridge Program PubKey
                const seeds = [
                    Buffer.from(this._primarySeed, "utf-8"),
                    account.toBuffer()
                ]
                const [solanaEscrowAccount] = await PublicKey.findProgramAddress(
                    seeds, bridgeProgram
                );
                console.log("solanaEscrowAccount: " + solanaEscrowAccount.toString());
                resolve(solanaEscrowAccount);

            } catch (error) {
                reject(error);
            }
        });
    }
    public async getTokenEscrowAccount(account: PublicKey): Promise<PublicKey> {
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._bridgeProgramAddress) throw new Error("Bridge Program Address is not set");

                //Get Bridge Program PubKey
                const bridgeProgram = new PublicKey(this._bridgeProgramAddress!);
                const solanaEscrowAccount = await this.getSolEscrowAccount(account);

                //Get Seets
                const seeds = [
                    Buffer.from(this._primarySeed, 'utf-8'),
                    solanaEscrowAccount.toBuffer(),
                    account.toBuffer(),
                ]
                const [solanaEscrowTokenAccount] = await PublicKey.findProgramAddress(
                    seeds, bridgeProgram
                );
                console.log("solanaEscrowTokenAccount: " + solanaEscrowTokenAccount.toString());
                resolve(solanaEscrowTokenAccount);

            } catch (error) {
                reject(error);
            }
        });
    }
    public async getAssetInfoAccount(account: PublicKey, mintAccount: PublicKey): Promise<PublicKey> {
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._bridgeProgramAddress) throw new Error("Bridge Program Address is not set");

                //Get Bridge Program PubKey
                const bridgeProgram = new PublicKey(this._bridgeProgramAddress!);

                //Get Seets
                const seeds = [
                    Buffer.from(this._primarySeed, "utf-8"),
                    account.toBuffer(),
                    mintAccount.toBuffer(),
                ]
                const [assetInfoAccount] = await PublicKey.findProgramAddress(
                    seeds, bridgeProgram
                );
                console.log("assetInfoAccount: " + assetInfoAccount.toString());
                resolve(assetInfoAccount);

            } catch (error) {
                reject(error);
            }
        });
    }
    public async getTokenAccount(account: PublicKey, mintAccount: PublicKey): Promise<PublicKey> {
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._bridgeProgramAddress) throw new Error("Bridge Program Address is not set");

                //Get Bridge Program PubKey
                const bridgeProgram = new PublicKey(this._bridgeProgramAddress!);

                //Get Seets
                const seeds = [
                    account.toBuffer(),
                    TOKEN_PROGRAM_ID.toBuffer(),
                    mintAccount.toBuffer(),
                ]
                const [solanaUserAtaAccount] = await PublicKey.findProgramAddress(
                    seeds, ASSOCIATED_TOKEN_PROGRAM_ID
                );
                console.log("solanaUserAtaAccount: " + solanaUserAtaAccount.toString());
                resolve(solanaUserAtaAccount);

            } catch (error) {
                reject(error);
            }
        });
    }

    public async HandleUsdc(account:SolanaAccount, routing:Routing, token:BridgeToken):Promise<Transaction | undefined> {
        return new Promise(async (resolve, reject) => {
            try{


                let transferAmount = 1000000;
                const USDCroutingData = {   
                    from: {
                      token: "USDC",
                      network: routing.from.network,
                      address: routing.from.address,
                      txn_signature: "",
                    },
                    to: {
                      token: "USDC",
                      network: routing.to.network,
                      address: routing.to.address,
                      txn_signature: "",
                    },
                    amount: transferAmount / 1000000,
                    units: BigInt(transferAmount),
                  } as Routing; 
                  
                  const bridgeNodeInstructionData:DepositNote = {
                    system: JSON.stringify({
                      from: USDCroutingData.from,
                      to: USDCroutingData.to,
                      amount: USDCroutingData.amount,
                      units: USDCroutingData.units?.toString(),
                    }),
                    date: "".concat(new Date().toString()),
                  };  // ? 

                 // 
                 // wallet connnections 
                 const PubKeywallet = new PublicKey(USDCroutingData.from.address);

        // const usdcAddressDevnet = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";  // usdc on devnet // need mint for perticular network
        const usdcMintAuthority = "2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9"; // usdc mint Authority 
        //EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v is the usdc on solana mainnet 
        const connection = new Connection(clusterApiUrl("devnet", true), "confirmed");
        const destination = "9i8vhhLTARBCd7No8MPWqJLKCs3SEhrWKJ9buAjQn6EM" ;  // GCW
        const memoProgram = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
        const solWallet = solanaWeb3.Keypair.fromSecretKey(account.sk);
        const usdcMint = await getMint(connection, new PublicKey(usdcMintAuthority));
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          solWallet,
          usdcMint.address,
          account.pk
        );

        // const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        //     connection,
        //     PubKeywallet,
        //     usdcMint.address,
        //     new PublicKey(destination), // destination
            
        // );


        let tx = new Transaction();
        tx.add(
            splToken.createTransferInstruction(
              fromTokenAccount.address,
              new PublicKey(destination), // to
              PubKeywallet,
              transferAmount,
              [],
              TOKEN_PROGRAM_ID
            )
          );

          tx.add(
            new TransactionInstruction({
              keys: [
                { pubkey: PubKeywallet, isSigner: true, isWritable: true },
              ],
              data: Buffer.from(JSON.stringify(bridgeNodeInstructionData), "utf-8"),
              programId: new PublicKey(memoProgram),
            })
          );
                  
                
              resolve(tx)  


            }
            catch(err){
                reject(err)
            }
        });
    }

    public async solBridgeTransaction(account: PublicKey, routing: Routing, token: BridgeToken): Promise<Transaction | undefined> {
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (token.symbol.toLowerCase() != "sol") throw new Error("Token must be SOL");
                if (!token.address) throw new Error("mint address is required");
                if (typeof token.address !== "string") throw new Error("token address is required in string format");
                if (!routing.amount) throw new Error("amount is required");
                if (!this._bridgeProgramAddress) throw new Error("Bridge Program Address is not set");
                if (!this._client) throw new Error("Client is not set");

              

                //Get Bridge Program PubKey
                const bridgeProgram = new PublicKey(this._bridgeProgramAddress!);

                //Get accounts
                const solanaEscrowAccount = await this.getSolEscrowAccount(account);

                let toAddress: Uint8Array | undefined = undefined;
                if (routing.to.network == "algorand") {
                    toAddress = algosdk.decodeAddress(routing.to.address).publicKey;
                }
                if (!toAddress) throw new Error("to address is required.  Could not deserialize address");

                //Get Data
                let amount = Number(ValueUnits.fromValue(routing.amount, token.decimals).units);
                let data = serialize(
                    BridgeInitSchema.init_schema,
                    new BridgeInitSchema({
                        algo_address: toAddress,
                        amount,
                    })
                );

                //Shift data
                data = new Uint8Array([10, ...data]);
                console.log(account.toBase58(), solanaEscrowAccount.toBase58())

                let instructions = new TransactionInstruction({
                    programId: bridgeProgram,
                    keys: [
                        { pubkey: account, isSigner: true, isWritable: true },
                        { pubkey: solanaEscrowAccount, isSigner: false, isWritable: true },
                        { pubkey: new PublicKey('GdMte7MdNc3n6zFKZAmKa3TCBhPooPNJ3cBGnJc3uHnG'), isSigner: false, isWritable: false },
                        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                    ],
                    data: Buffer.from(data)
                });

                const latestBlockhash = await this._client.getLatestBlockhash('finalized')
                const transaction = new Transaction({
                    blockhash: latestBlockhash.blockhash,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                });
                transaction.add(...[instructions])

                resolve(transaction);

            } catch (error) {
                reject(error);
            }
        });

    }
    public async tokenBridgeTransaction(account: PublicKey, routing: Routing, token: BridgeToken): Promise<Transaction | undefined> {
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                 if (token.symbol.toLowerCase() == "sol") throw new Error("Token must be SOL");
                if (!token.address) throw new Error("mint address is required");
                if (typeof token.address !== "string") throw new Error("token address is required in string format");
                if (!routing.amount) throw new Error("amount is required");
                // if (!this._bridgeProgramAddress) throw new Error("Bridge Program Address is not set");
                if (!this._client) throw new Error("Client is not set");

                //Get Bridge Program PubKey
                const bridgeProgram = new PublicKey(this._bridgeProgramAddress!);

                //Get accounts
                const solEscrowAccount = await this.getSolEscrowAccount(account);
                const tokenEscrowAccount = await this.getTokenEscrowAccount(account);
                const userTokenAccount = await this.getTokenAccount(account, new PublicKey(token.address));
                const mintToken= new PublicKey(token.address);
                //const solanaEscrowA = await this._client.getAccountInfo(solanaEscrowAccount  )
                //console.log(util.inspect(solanaEscrowA, false, 5, true /* enable colors */))

                let toAddress: Uint8Array | undefined = undefined;
                if (routing.to.network == "algorand") {
                    toAddress = algosdk.decodeAddress(routing.to.address).publicKey;
                }
                if (!toAddress) throw new Error("to address is required.  Could not deserialize address");

                //Get Data
                let amount = Number(ValueUnits.fromValue(routing.amount, token.decimals).units);
                let data = serialize(
                    BridgeInitSchema.init_schema,
                    new BridgeInitSchema({
                        algo_address: toAddress,
                        amount,
                    })
                );

                //Shift data
                data = new Uint8Array([20, ...data]);
                console.log(account.toBase58(), solEscrowAccount.toBase58())

                let instructions = new TransactionInstruction({
                    programId: bridgeProgram,
                    keys: [
                        { pubkey: account, isSigner: true, isWritable: false },
                        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
                        { pubkey: solEscrowAccount, isSigner: false, isWritable: true },
                        { pubkey: tokenEscrowAccount, isSigner: false, isWritable: true },
                        { pubkey: new PublicKey('2g1SsjER76eKTLsSCdpDyB726ba8SwvN23YMoknTHvmX'), isSigner: false, isWritable: false },
                        { pubkey: mintToken, isSigner: false, isWritable: false },
                        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                    ],
                    data: Buffer.from(data)
                });                

                const latestBlockhash = await this._client.getLatestBlockhash('finalized')
                const transaction = new Transaction({
                    blockhash: latestBlockhash.blockhash,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                });
                transaction.add(...[instructions])

                resolve(transaction);

            } catch (error) {
                reject(error);
            }
        });

    }



}

class BridgeInitSchema {
    readonly algo_address: Uint8Array
    readonly amount: number
    constructor(properties: { algo_address: Uint8Array, amount: number }) {
        this.algo_address = properties.algo_address
        this.amount = properties.amount;
    }

    static init_schema = new Map([
        [
            BridgeInitSchema,
            {
                kind: "struct",
                fields: [
                    ["algo_address", [32]],
                    ["amount", "u64"],
                ],
            },
        ],
    ]);
}
class BridgeSetSchema {
    readonly validator_address: Uint8Array

    constructor(properties: { validator_address: Uint8Array }) {
        this.validator_address = properties.validator_address

    }

    static set_schema = new Map([
        [
            BridgeSetSchema,
            {
                kind: "struct",
                fields: [
                    ["validator_address", [32]],
                ],
            },
        ],
    ]);
}

