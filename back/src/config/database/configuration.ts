import { registerAs } from '@nestjs/config';

export interface DatabaseMongoAppConfigType {
  dbName: string;
  dbHost: string;
  dbPort: number;
  user: string;
  password: string;
}

export default registerAs<Partial<DatabaseMongoAppConfigType>>(
  'database/mongo',
  () => ({
    dbName: process.env.DB_NAME,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }),
);
