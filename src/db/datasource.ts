import { DataSource } from "typeorm";
import 'dotenv/config';

export default new DataSource({
        type: "postgres",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT as unknown as number,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: false,
        logging: false,
        entities: [__dirname + '/**/*.entity.*{js,ts}'],
        migrations: [__dirname + "/migrations/*{.ts,.js}"],
        ssl: {
          ca: process.env.CA_CERT
        }
  })