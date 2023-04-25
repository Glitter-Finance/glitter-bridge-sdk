import { BridgeNetworks, BridgeTokens, BridgeV2Tokens, ChainStatus, GlitterEnvironment, Sleep, TransactionType } from "@glitter-finance/sdk-core";
import { GlitterSolanaPoller } from "../../src/lib/chains/solana/poller.solana";
import { GlitterPoller } from "../../src/lib/common/poller.Interface";
import { GlitterSDKServer } from "../../src/lib/glitterSDKServer";
import * as util from "util";
import { config } from "dotenv";
import path from "path";
import * as assert from "assert";
//import { done } from 'jest';

describe("Eth Poller USDC Tests ", () => {

    it("Default Ethereum", async () => {

        //Initialize SDK
        const sdk = new GlitterSDKServer(GlitterEnvironment.testnet);

        //Create Solana Poller
        sdk.createPollers([BridgeNetworks.Ethereum]);

        //local references for ease of use
        const poller = sdk.poller(BridgeNetworks.Ethereum);
        if (!poller) throw Error("Poller is undefined");

        //Deposits
        let expected = [
            "0x6e1f935edad67a6d9cc0d4f5b166ef0c63d781353bab11ec25946c2bff29a9e9",
            "0x921fc2a1305ac26b19a3486612618e80613a8a5c055237a494914c9113b91429",
            "0xc1c7de44084984af9c624b706bd7e2510aa31f6cb09462e25f75950688001071",
            "0x7d6a86ec4fd3f9fe4da54cf411f8b932447d7a6de3096d006db7126d5b902bb2"
        ];

        await common(sdk, poller, TransactionType.Deposit, expected, "0xcc7c1e17c5f4acfd18817c57656c494966b4e8dd0d8746461143833c81ea260e");
                
        //Releases
        expected = [
            "0x118b728d4a4fd23d8efc34bf5671292e78fe47cd9f061f279664f08f75462755",
            "0x68a2f7ceec9d598ebc4c4505e77657220ac4d835c6d791b755098d736526312c",
        ];

        await common(sdk, poller, TransactionType.Release, expected, "0xcc7c1e17c5f4acfd18817c57656c494966b4e8dd0d8746461143833c81ea260e");

        //Refunds
        expected = [
            "0x118b728d4a4fd23d8efc34bf5671292e78fe47cd9f061f279664f08f75462755",
            "0x68a2f7ceec9d598ebc4c4505e77657220ac4d835c6d791b755098d736526312c",
        ];

        await common(sdk, poller, TransactionType.Refund, expected, "0xcc7c1e17c5f4acfd18817c57656c494966b4e8dd0d8746461143833c81ea260e");
        
        Promise.resolve();
    }, 120_000);
    
    it("Default Arbitrum", async () => {

        //Initialize SDK
        const sdk = new GlitterSDKServer(GlitterEnvironment.testnet);

        //Create Solana Poller
        sdk.createPollers([BridgeNetworks.Arbitrum]);

        //local references for ease of use
        const poller = sdk.poller(BridgeNetworks.Arbitrum);
        if (!poller) throw Error("Poller is undefined");

        //Deposits
        let expected = [
            "0x2d264ca07a63b4ee087b52fd191d6cc0e2629985b94dd0b7aa0223d2e3a4c322",
            "0xa23b0acdefc5e55957ff200e45fd53aa17b950757c5230b7ce5d5758992e0969",
            "0x2aac22ef855eda1d2c03097ce03b327d3b4677b30527cbe8ed3ff99c75ef1660",
            "0x57a146dcb281f27eb87e6aff0bd703281238b50d1a0e0f77ff5e50f492907ff4"
        ];

        await common(sdk, poller, TransactionType.Deposit, expected, "0xae2e173fff1c0bcb65ff9b62a1b7ff10294b736874ab00e77ff716cbbad4b4f0");
                
        //Releases
        expected = [
            "0x452bf9e50e7087c62ba8b2689262aefcce20eaea15b0c076fecc25deab66d2d2",
            "0x1de9a443fe63c4c6d64e4a50bd9095403ee2ef8d0fd2664df02450cd1daf9c57",
        ];

        await common(sdk, poller, TransactionType.Release, expected, "0xae2e173fff1c0bcb65ff9b62a1b7ff10294b736874ab00e77ff716cbbad4b4f0");

        //Refunds
        expected = [
            "0xc2803fb30daacc9bef608f7de8ca74e26675d4f63dd6edea9370d0bb14b0c810",
            "0xae2e173fff1c0bcb65ff9b62a1b7ff10294b736874ab00e77ff716cbbad4b4f0",
        ];

        await common(sdk, poller, TransactionType.Refund, expected, "0xae2e173fff1c0bcb65ff9b62a1b7ff10294b736874ab00e77ff716cbbad4b4f0");
        
        Promise.resolve();
    }, 120_000);

    it("Default Avalanche", async () => {

        //Initialize SDK
        const sdk = new GlitterSDKServer(GlitterEnvironment.testnet);

        //Create Solana Poller
        sdk.createPollers([BridgeNetworks.Avalanche]);

        //local references for ease of use
        const poller = sdk.poller(BridgeNetworks.Avalanche);
        if (!poller) throw Error("Poller is undefined");

        //Deposits
        let expected = [
            "0x8b0013511478ebfc56d8b54a01bb9f1953a961a02f34986b76a4923993b75ead",
            "0xe74a9418fe81da8af9874fad786c1cc24c8e24192e924f368bb0564ee8c837b6",
            "0x9a081f111c4619c4ca47dfea796e8bcbabd79ee0001f002abc58450b7aa7bfce",
            "0xda1318e11458d53c7bb546ecfff648113e35c96a2cf2229fd619ce45addf8fea"
        ];

        await common(sdk, poller, TransactionType.Deposit, expected, "0xae2e173fff1c0bcb65ff9b62a1b7ff10294b736874ab00e77ff716cbbad4b4f0");
                
        //Releases
        expected = [
            "0x407ccaa4fa846c252e9000beca457a7751ab57489eaecabf4e14b07f47dcbbde",
            "0x342f118861cc798f851ac612cbc24753ce5956ac5cf90ed6f35e4129df7952f2",
        ];

        await common(sdk, poller, TransactionType.Release, expected, "0xae2e173fff1c0bcb65ff9b62a1b7ff10294b736874ab00e77ff716cbbad4b4f0");

        //Refunds
        expected = [
            "0x2a1f1fff79aa7721132dc8c185b509db6e889ab20e60c7d58f52ccbe5686c6dc",
            "0x2e4bfd010dfe7ae083fd31becde6ec78e7d2702192682022292887956a71b31c",
        ];

        await common(sdk, poller, TransactionType.Refund, expected, "0xae2e173fff1c0bcb65ff9b62a1b7ff10294b736874ab00e77ff716cbbad4b4f0");
        
        Promise.resolve();
    }, 120_000);
    
    async function common(sdk: GlitterSDKServer, poller: GlitterPoller, txnType: TransactionType, expected: string[], endTxn: string){

        //Ensure Poller & Cursor is defined
        if (!poller) throw Error("Poller is undefined");
        const localCursor = poller.tokenV2Cursor;
        assert(localCursor != undefined, "Cursor is undefined");

        //Set limit to 20 // Token bridge needs to larger since multiple logs are emitted on some blocks
        localCursor.limit = 20;
        localCursor.filter = {
            txnType: txnType,
            chainStatus: ChainStatus.Completed,
        }
            
        //Get Results
        const result = await poller.poll(sdk, localCursor);

        console.log(util.inspect(result, false, null, true /* enable colors */));
        
        //Grab all Txn IDs
        const txnIds = result.txns.map((txn) => txn.txnID);
        assert(txnIds.length == expected.length, `Txn IDs are not ${expected.length}`)

        //Check if all expected txns are present
        assert(txnIds.every((val, index) => val === expected[index]), `Txn ${txnIds} does not match ${expected}`);             

        //Check if next cursor is defined
        assert(result.cursor != undefined, "Next Cursor is undefined");

        //Check value of next cursor
        assert(result.cursor.batch == undefined, "Batch is not undefined");
        assert(result.cursor.end?.txn == endTxn, `End txn is not ${endTxn}`);
        
    }

    afterAll(async () => {
        console.log("Closing SDK");
    });
});
