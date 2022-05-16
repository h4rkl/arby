import client_sessions from 'client-sessions';
import express, {Request, Response} from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import {Cluster, Connection, Keypair} from '@solana/web3.js';
import {Jupiter} from '@jup-ag/core';
import FtxClient from './src/services/ftx';

import api from './src/api';

require('dotenv').config();

const app = express();

const FTX = new FtxClient(process.env.FTX_API_KEY, process.env.FTX_API_SECRET);
app.set('ftx', FTX);

const connection = new Connection(process.env.SOLANA_RPC_ENDPOINT!);
const key = process.env.RANDOM_ARRAY!.split(',');
const USER_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from(key as any));
const cluster = process.env.CLUSTER! as Cluster;
let jupiter;
(async () => {
  try {
    jupiter = await Jupiter.load({
      connection,
      cluster,
      user: USER_KEYPAIR.publicKey, // Or public key
    });
    console.log(
      `Jupiter connected to '${process.env.CLUSTER}' at URL ${process.env.SOLANA_RPC_ENDPOINT}`,
    );
  } catch (error) {
    console.log(`Jupiter connect error: ${error}`);
  }
})();
app.set('jupiter', jupiter);

app.get('/', (request: Request, response: Response) =>
  response.sendStatus(200),
);
app.get('/health', (request: Request, response: Response) =>
  response.sendStatus(200),
);

app.use(morgan('short'));
app.use(express.json());
app.use(
  client_sessions({
    cookieName: 'session',
    secret: process.env.SESSION_SECRET!,
    duration: 24 * 60 * 60 * 1000,
  }),
);
app.use(helmet());

app.use(api);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`App started on PORT ${PORT}`);
});
