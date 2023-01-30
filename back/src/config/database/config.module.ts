import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { DatabaseMongoAppConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        dbName: Joi.string(),
        host: Joi.string(),
        port: Joi.number().port(),
        user: Joi.number(),
        password: Joi.number(),
      }),
    }),
  ],
  providers: [DatabaseMongoAppConfigService],
  exports: [DatabaseMongoAppConfigService],
})
export class DatabaseMongoAppConfigModule {}
