import type { Config } from '@netlify/functions';
import { createHash } from 'node:crypto';
import { bad, json, space } from './_lib.mts';

/**
 * Cloudinary signed-upload params.
 *
 * The browser uploads straight to Cloudinary with a short-lived signature, so
 * the API secret never leaves this function. Uploads are pinned to a folder
 * derived from the caller's space and capped by an eager transform, which keeps
 * a leaked URL from being useful for dumping arbitrary media into the account.
 */
export default async (req: Request) => {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) return bad('storage not configured', 503);

  const s = space(req);
  if (!s) return bad('bad space');

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `shlyakh/${s}`;

  // Cloudinary signs the alphabetically-sorted params, secret appended.
  const params: Record<string, string> = { folder, timestamp: String(timestamp) };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  const signature = createHash('sha1').update(toSign + secret).digest('hex');

  return json({
    cloudName: cloud,
    apiKey: key,
    timestamp,
    folder,
    signature,
    endpoint: `https://api.cloudinary.com/v1_1/${cloud}/auto/upload`,
  });
};

export const config: Config = { path: '/api/upload-sign' };
