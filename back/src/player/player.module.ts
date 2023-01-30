import { Module } from '@nestjs/common';
import { Player } from '../entities/player.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PlayerService } from './player.service';

@Module({
  imports: [MikroOrmModule.forFeature([Player])],
  providers: [PlayerService],
})
export class PlayerModule {}
