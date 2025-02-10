import 'reflect-metadata';
import type { Request, Response } from 'express';
import express from 'express';
import { identify } from './identify.service';
import AppDatasource from './db/datasource';
import 'dotenv/config';

const app = express();

app.use(express.json());

app.post('/identify', async (req: Request<{}, {}, { email: string, phoneNumber: string }>, res: Response) => {
  const { email, phoneNumber } = req.body;

  const contact = await identify(email, phoneNumber);
  res.status(200).json(contact);
});

const PORT = process.env.PORT;
AppDatasource.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`App started on port ${PORT}`);
  });
});