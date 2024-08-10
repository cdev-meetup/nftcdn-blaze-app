"use server";

import { createHmac } from "crypto";

// Your nftcdn.io subdomain and secret key
const domain = "preprod";
const key = Buffer.from("7FoxfBgV2k+RSz6UUts3/fG1edG7oIGXxdtIVCdalaI=", "base64").valueOf(); // free preprod key

/**
 * Get the image nftcdn.io URL of an asset.
 * @param {string} fingerprint (Eg. `asset1..`)
 * @param {number} size Image size
 * @returns Image nftcdn.io URL
 */
export async function getImgUrl(fingerprint: string, size: number = 256) {
  return nftcdnUrl(fingerprint, "/image", { size });
}

/**
 * Get the asset metadata from nftcdn.io
 * @param {string} fingerprint (Eg. `asset1..`)
 * @returns Metadata of the asset
 */
export async function getMetadataJson(fingerprint: string) {
  const metadataUrl = nftcdnUrl(fingerprint, "/metadata");
  const metadata = await fetch(metadataUrl);
  return await metadata.json();
}

/** EXAMPLES:
 * - `nftcdnUrl("asset1..", "/image")`
 * - `nftcdnUrl("asset1..", "/image", { size: 256 })`
 * - `nftcdnUrl("asset1..", "/metadata")`
 *
 * @param fingerprint Asset fingerprint (eg. `asset1..`)
 * @param path Request path (eg. `/image`, `/metadata`)
 * @param params Request params (eg. `{ size: 256 }`)
 * @returns `https://asset1...preprod.nftcdn.io/path?tk=token`
 */
function nftcdnUrl(fingerprint: string, path: string, params: Record<string, any> = {}) {
  params.tk = "";
  let url = buildUrl(domain, fingerprint, path, params);
  // base64url codec requires Node.js >= 16, else 3rd party libraries can be used
  params.tk = createHmac("sha256", key).update(url).digest("base64url");
  return buildUrl(domain, fingerprint, path, params);
}

function buildUrl(domain: string, fingerprint: string, path: string, params: Record<string, any>) {
  const searchParams = new URLSearchParams(params);
  return `https://${fingerprint}.${domain}.nftcdn.io${path}?${searchParams.toString()}`;
}
