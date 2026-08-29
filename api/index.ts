import 'dotenv/config';
import { createApp } from '../dist/server.cjs';

let cachedApp: any = null;

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await createApp();
  }
  return cachedApp(req, res);
}

