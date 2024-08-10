import { CIP30Interface } from "@blaze-cardano/sdk";

export declare type Wallet = {
  name: string;
  icon: string;
  apiVersion: string;
  enable(): Promise<CIP30Interface>;
  isEnabled(): Promise<boolean>;
};

export declare type Cardano = {
  [key: string]: Wallet;
};

declare global {
  interface Window {
    cardano: Cardano;
  }
}
