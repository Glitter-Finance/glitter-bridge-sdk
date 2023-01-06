import { PeraWalletConnect } from "@perawallet/connect";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import { BridgeToken } from "../../common";

export type AlgorandConfig = {
  name: string;
  serverUrl: string;
  serverPort: string | number;
  indexerUrl: string;
  indexerPort: string | number;
  nativeToken: string;
  appProgramId: number;
  accounts: AlgorandAccountsConfig;
  tokens: BridgeToken[];
};
export type PeraWalletResult = {
  address: string;
  wallet: PeraWalletConnect;
};

export type MyAlgoWalletResult = {
  address: string;
  wallet: MyAlgoConnect;
};
export type AlgorandAccountsConfig = {
  asaOwner: string;
  algoOwner: string;
  bridgeOwner: string;
  feeReceiver: string;
  multiSig1: string;
  multiSig2: string;
  bridge: string;
  asaVault: string;
  algoVault: string;
  usdcReceiver: string;
  usdcDeposit: string;
};