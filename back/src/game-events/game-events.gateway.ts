import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { ObjectId } from '@mikro-orm/mongodb';
import { GameController } from '../game/game.controller';
import { UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from '../wsexception-filter/wsexception-filter.filter';
import { Server, Socket } from 'socket.io';
import { Round, RoundEvents } from '../entities/round.entity';
import { OnEvent } from '@nestjs/event-emitter';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MAX,
} from 'class-validator';
import BigNumber from 'bignumber.js';
import {
  MAX_SECRET_NUMBER_EXCLUSIVE,
  SECRET_NUMBER_STEP,
} from '../secret-number/secret-number.service';

//These 2 DTOs would be validated with global ValidationPipe
class StartGameRequestDto {
  @IsString()
  playerId?: string;
}

class GuessRequestDto {
  @IsString()
  @IsNotEmpty()
  playerId: string;

  @IsNumber({ maxDecimalPlaces: new BigNumber(SECRET_NUMBER_STEP).dp() ?? 0 })
  @IsPositive()
  @Max(MAX_SECRET_NUMBER_EXCLUSIVE - SECRET_NUMBER_STEP)
  guessedNumber: number;
}

//since service and controller throw HttpExceptions, catch them properly at WS gateway
@UseFilters(WsExceptionFilter)
@WebSocketGateway({ transport: [] })
/**
 * Socket.io frontend client must connect to this gateway and ble to:
 * - send play event with or without (playerId), when n playerId,
 *    it would be created and sent back to client, client must store it at localStorage/cookie to work with same value after reconnecting
 * - send guess event
 * - handle 'round.created' event from server
 * - handle 'round.started' event from server
 * - handle 'round.finished' event from server
 */
export class GameEventsGateway {
  @WebSocketServer() private server: Server;

  constructor(private readonly gameController: GameController) {}

  @SubscribeMessage('play')
  public async handlePlayMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: StartGameRequestDto,
  ): Promise<WsResponse<{ playerId: string }>> {
    const player = await this.gameController.startRound(
      data.playerId ? new ObjectId(data.playerId) : undefined,
    );

    //client join current round's room to receive all messages related to it
    //room named after round's id
    client.join(player.round._id.toString());

    return { event: 'play', data: { playerId: player._id.toString() } };
  }

  @SubscribeMessage('guess')
  public async handleGuessMessage(
    client: Socket,
    @MessageBody() data: GuessRequestDto,
  ): Promise<WsResponse<undefined>> {
    await this.gameController.guess(
      new ObjectId(data.playerId),
      data.guessedNumber,
    );
    return { event: 'guess', data: undefined };
  }

  @OnEvent(RoundEvents.CREATED)
  handleOrderCreatedEvent(round: Round) {
    this.server.to(round._id.toString()).emit(RoundEvents.CREATED);
  }

  @OnEvent(RoundEvents.STARTED)
  handleOrderStartedEvent(round: Round) {
    this.server.to(round._id.toString()).emit(RoundEvents.STARTED);
  }

  @OnEvent(RoundEvents.FINISHED)
  handleOrderFinishedEvent(round: Round) {
    const room = round._id.toString();
    this.server.to(room).emit(RoundEvents.FINISHED);
    //unsubscribe clients, cause these rooms will never get updates
    this.server
      .to(room)
      .fetchSockets()
      .then((clients) => clients.forEach((client) => client.leave(room)));
  }
}
