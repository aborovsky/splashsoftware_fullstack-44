import { Module } from '@nestjs/common';
import { PlayerModule } from './player/player.module';
import { MongoProviderModule } from './providers/database/mongo/provider.module';
import { RoundModule } from './round/round.module';
import { GameEventsGateway } from './game-events/game-events.gateway';
import { GameController } from './game/game.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    MongoProviderModule,
    PlayerModule,
    RoundModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [GameEventsGateway],
  controllers: [GameController],
})
export class AppModule {}
