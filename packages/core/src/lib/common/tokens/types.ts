interface BaseTokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  feeDivisor?: number;
  minTransfer?: number;
  maxTransfer?: number;
  totalSupply?: bigint;
}

export type BridgeTokenConfig = { 
  address: string;
  wrappedSymbol?: string
} & BaseTokenConfig;

export type AlgorandStandardAssetConfig = {
  assetId: number;
  wrappedSymbol?: string
} & BaseTokenConfig;

export type AlgorandNativeTokenConfig = {
  isNative: boolean;
  wrappedSymbol?: string;
} & BaseTokenConfig;