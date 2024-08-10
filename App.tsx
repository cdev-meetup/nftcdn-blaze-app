import { useEffect, useState } from "react";

// NextJS
import Image from "next/image";
import { useRouter } from "next/navigation";

// NextUI
import { Button } from "@nextui-org/button";
import { Card, CardFooter } from "@nextui-org/card";

// Blaze
import { Blaze, Core, Blockfrost, WebWallet } from "@blaze-cardano/sdk";
import { Wallet } from "./types/global";

// NFTCDN
import AssetFingerprint from "@emurgo/cip14-js";
import { getImgUrl, getMetadataJson } from "./utils/nftcdn";

const provider = new Blockfrost({
  network: "cardano-preprod",
  projectId: `${process.env.NEXT_PUBLIC_BLOCKFROST_PID}`,
});

export default function App() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [blaze, setBlaze] = useState<Blaze<Blockfrost, WebWallet>>();
  const [assetFingerprints, setAssetFingerprints] = useState<string[]>([]);

  useEffect(() => {
    const wallets = [];

    const { cardano } = window;
    for (const wallet in cardano) {
      const { apiVersion } = cardano[wallet];
      if (apiVersion) {
        wallets.push(cardano[wallet]);
      }
    }

    wallets.sort((l, r) => {
      return l.name.toUpperCase() < r.name.toUpperCase() ? -1 : 1;
    });
    setWallets(wallets);
  }, []);

  async function connectWallet({ enable }: Wallet) {
    const cip30 = await enable();
    const wallet = new WebWallet(cip30);

    const blaze = await Blaze.from(provider, wallet);
    setBlaze(blaze);

    const assetFingerprints = [];
    const utxos = await blaze.wallet.getUnspentOutputs();
    for (const utxo of utxos) {
      const units = utxo.output().amount().multiasset()?.keys();
      if (!units) continue; // skip

      for (const unit of units) {
        const policyID = Buffer.from(Core.AssetId.getPolicyId(unit), "hex").valueOf();
        const assetName = Buffer.from(Core.AssetId.getAssetName(unit), "hex").valueOf();

        const fingerprint = AssetFingerprint.fromParts(policyID, assetName).fingerprint();
        assetFingerprints.push(fingerprint);
      }
    }
    setAssetFingerprints(assetFingerprints);
  }

  function AssetCard(props: { fingerprint: string }) {
    const router = useRouter();

    const [imgURL, setImgURL] = useState("https://gen-wealth.github.io/public/placeholder.webp");
    const [asset, setAsset] = useState<Record<string, any>>();

    useEffect(() => {
      getImgUrl(props.fingerprint).then(setImgURL);
      getMetadataJson(props.fingerprint).then(setAsset);
    }, []);

    // useEffect(() => {
    //   if (asset) console.log(asset);
    // }, [asset]);

    return (
      <Card isFooterBlurred radius="lg" className="border-none">
        <Image src={imgURL} alt={props.fingerprint} width={200} height={200} className="object-cover" />
        <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
          <p className="text-tiny text-white/80">{asset?.name ?? "Loading..."}</p>
          <Button
            onClick={() => router.push(`https://preprod.cexplorer.io/asset/${props.fingerprint}`)}
            className="text-tiny text-white bg-black/20"
            variant="flat"
            color="default"
            radius="lg"
            size="sm"
          >
            Cexplorer
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {blaze // is wallet connected?
        ? assetFingerprints.map((fingerprint, f) => {
            return <AssetCard key={`fingerprint.${f}`} fingerprint={fingerprint} />;
          })
        : // no wallet connected yet:
          wallets.map((wallet, w) => {
            return (
              <Button
                key={`wallet.${w}`}
                onClick={() => connectWallet(wallet)}
                className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg capitalize"
                radius="full"
              >
                {wallet.name}
              </Button>
            );
          })}
    </div>
  );
}
