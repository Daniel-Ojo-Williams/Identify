import 'reflect-metadata';
import type { Request, Response } from 'express';
import express from 'express';
import { identify } from './identify.service';
import AppDatasource from './db/datasource';
import 'dotenv/config';
import { validator } from './middleware';
import { identifyDto } from './validator';
import { errorHandler } from './errorHandler';

const app = express();

app.use(express.json());

app.post('/identify', validator(identifyDto),  async (req: Request<{}, {}, { email: string, phoneNumber: string }>, res: Response) => {
  const { email, phoneNumber } = req.body;

  const contact = await identify(email, phoneNumber);
  res.status(200).json(contact);
});

app.use(errorHandler);

const PORT = process.env.PORT;
AppDatasource.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`App started on port ${PORT}`);
  });
});