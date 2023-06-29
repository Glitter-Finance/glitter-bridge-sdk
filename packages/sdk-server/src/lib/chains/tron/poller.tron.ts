import { BridgeNetworks, BridgeType, PartialBridgeTxn, Sleep } from "@glitter-finance/sdk-core";
import { GlitterSDKServer } from "../../../glitterSDKServer";
import { Cursor, CursorFilter, NewCursor, UpdateCursor } from "../../common/cursor";
import { GlitterPoller, PollerResult } from "../../common/poller.Interface";
import { ServerError } from "../../common/serverErrors";
import axios, { AxiosResponse } from 'axios';
import * as util from 'util';
import { TronCircleParser } from "./poller.tron.circle";

export class GlitterTronPoller implements GlitterPoller {
   
    //Network
    public network: BridgeNetworks = BridgeNetworks.TRON;
    
    //Cursors
    public cursors: Record<BridgeType, Cursor[]> ;
    public get tokenV1Cursor(): Cursor | undefined{
        return this.cursors?.[BridgeType.TokenV1]?.[0];
    }
    public get tokenV2Cursor(): Cursor | undefined{
        return this.cursors?.[BridgeType.TokenV2]?.[0];
    }
    public get usdcCursors(): Cursor[] | undefined{
        return this.cursors?.[BridgeType.Circle];
    }

    constructor() {
        this.cursors = {
            [BridgeType.TokenV1]: [],
            [BridgeType.TokenV2]: [],
            [BridgeType.Circle]: [],
            [BridgeType.Unknown]: []
        };
    }
    
    //Initialize
    initialize(sdkServer: GlitterSDKServer): void {

        //Add USDC Cursors
        const usdcAddresses = [
            sdkServer.sdk?.tron?.getTronAddress("depositWallet"),
            sdkServer.sdk?.tron?.getTronAddress("releaseWallet"),
        ];      

        usdcAddresses.forEach((address) => {
            if (address)
                this.cursors[BridgeType.Circle]?.push(
                    NewCursor(BridgeNetworks.TRON, BridgeType.Circle, address, sdkServer.defaultLimit)
                );
        });
    }

    //Poll
    async poll(sdkServer: GlitterSDKServer, cursor: Cursor): Promise<PollerResult> {

        const lastTimestamp_ms: number = cursor.batch?.lastTimestamp_ms || cursor.end?.lastTimestamp_ms || 0;

        //Poll for new txns
        const address = cursor.address;
        let response: AxiosResponse<any, any> |undefined= undefined;
        let attempts = 0;
        do {
            try {
                response = await axios.get(`https://api.trongrid.io/v1/accounts/${address}/transactions/trc20`, {
                    params: {
                        limit: cursor.limit,
                        order_by: 'timestamp,asc',
                        min_timestamp: lastTimestamp_ms,
                    }
                });
                break;
            } catch (e: any) {
                attempts++;
                console.log(`Error getting signatures for address: ${e.message}`);
                console.log(`Retrying ${attempts} of 5`);
                await Sleep(250);
            }
        } while (attempts < 5);
        if (attempts >= 5) throw new Error(`Error getting signatures for address: ${address}`);
        if (!response) throw new Error(`Error getting signatures for address: ${address}`);

        const results = response.data.data;

        // Get New Txns
        let newLastTimestamp_ms = lastTimestamp_ms;
        const newTxns:string[] = [];
        for (let index = 0; index < results.length; index++) {
            const txn = results[index];
            const txID = txn.transaction_id;
            const timestamp = txn.block_timestamp;

            //Check if transaction was previously processed
            if (cursor.batch?.txns?.has(txn.transaction_id)) continue;
            if (cursor.lastBatchTxns?.has(txn.transaction_id)) continue;
     
            //Check if new
            if (timestamp > newLastTimestamp_ms) newLastTimestamp_ms = timestamp;

            //push to list
            newTxns.push(txID);
        }

        console.log(util.inspect(newTxns, false, null, true /* enable colors */));

        //Get partial transactions
        const partialTxns: PartialBridgeTxn[] = [];
        for (const txnID of newTxns) {
            try {            
               
                //Process Transaction
                const partialTxn = await this.parseTxnID(sdkServer, txnID, cursor.bridgeType);
                if (!partialTxn) continue;

                //Run Through Filter
                if (CursorFilter(cursor, partialTxn)) partialTxns.push(partialTxn);    

            } catch (error) {
                console.error((error as Error).message)
            }
        }

        //update cursor
        cursor = await UpdateCursor(cursor, newTxns, undefined, undefined, newLastTimestamp_ms);
        
        return {
            cursor: cursor,
            txns: partialTxns
        };
       
    }

    async parseTxnID(sdkServer: GlitterSDKServer, txnID:string, type:BridgeType):Promise<PartialBridgeTxn | undefined>{
        try {
            //Ensure Transaction Exists
            if (!txnID) return undefined;

            //Process Transaction
            switch (type) {                   
                case BridgeType.Circle:
                    return await TronCircleParser.process(
                        sdkServer,
                        txnID,
                        sdkServer.sdk?.tron
                    );
                    break;
                default:
                    throw ServerError.InvalidBridgeType(
                        BridgeNetworks.solana,
                        type
                    );
            }
                      
        } catch (error) {
            console.error((error as Error).message)
        }

        return undefined;

    }
}
