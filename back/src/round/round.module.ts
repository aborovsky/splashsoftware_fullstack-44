import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Round } from '../entities/round.entity';
import { RoundService } from './round.service';
import { SecretNumberService } from '../secret-number/secret-number.service';

@Module({
  imports: [MikroOrmModule.forFeature([Round])],
  providers: [SecretNumberService, RoundService],
  exports: [RoundService],
})
export class RoundModule {}
