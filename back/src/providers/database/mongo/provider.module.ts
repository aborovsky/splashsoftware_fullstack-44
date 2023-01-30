import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { DatabaseMongoAppConfigModule } from '../../../config/database/config.module';
import { DatabaseMongoAppConfigService } from '../../../config/database/config.service';

@Module({
  imports: [
    DatabaseMongoAppConfigModule,
    MikroOrmModule.forRootAsync({
      inject: [DatabaseMongoAppConfigModule],
      useFactory: (configService: DatabaseMongoAppConfigService) => ({
        autoLoadEntities: true,
        ensureIndexes: true,
        ensureDatabase: true,
        type: 'mongo',
        discovery: {
          warnWhenNoEntities: true,
        },
        dbName: configService.dbName,
        host: configService.dbHost,
        port: configService.dbPort,
        user: configService.user,
        password: configService.password,
        implicitTransactions: true,
      }),
    }),
  ],
})
export class MongoProviderModule {}
