import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Player, PlayerType } from '../entities/player.entity';
import { Round, RoundEvents, RoundState } from '../entities/round.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { SecretNumberService } from '../secret-number/secret-number.service';
import { RoundArchive } from '../entities/round-archive.entity';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

/**
 * Could be moved to configuration config/game GameAppConfigModule.
 * To load these values from Env params.
 */
const ROUND_PLAYERS = 5;
const ROUND_PARTICIPATION_CREDIT = 10;

/**
 * All 3 service methods (create, start, finish) must do the DB changes in single transactions.
 * That's why one rely here heavily on mikro-orm's implicit mongodb transaction.
 * To let mongodb provide multi-document transactions, requirements must be met:
 * - https://mikro-orm.io/docs/usage-with-mongo#transactions
 * - https://mikro-orm.io/docs/unit-of-work#implicit-transactions
 */
@Injectable()
export class RoundService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepo: EntityRepository<Player>,
    @InjectRepository(Round)
    private readonly roundRepo: EntityRepository<Round>,
    @InjectRepository(RoundArchive)
    private readonly roundArchiveRepo: EntityRepository<RoundArchive>,
    private readonly secretNumber: SecretNumberService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Intentionally store round as separate mongodb collection to not overwhelm player model
   * with constantly growing previous rounds list.
   * @param round
   * @private
   */
  private async archiveRound(round: Round) {
    const roundArchive = new RoundArchive(round);
    await this.roundRepo.remove(round);
    //intentionally store in async way to speed up current round processing, cause archiving the round is 2nd priority task
    return this.roundArchiveRepo.persistAndFlush(roundArchive);
  }

  /**
   * Find the round player taking a part right now.
   * User allowed to take a place only at one round in a time.
   * It will create the round (with 4 rest computer players) is absent.
   *
   * @param player {Player}
   */
  public async create(player: Player): Promise<Round> {
    if (player.round && player.round.state === RoundState.FINISHED) {
      //round finished, store it to archive, create new activeRound
      this.archiveRound(player.round).catch((e) =>
        console.error('Cannot store round in archive', e),
      );
    } else if (player.round && player.round.state === RoundState.CREATED) {
      //brand new (not yet started) round is already exists, just return it
      return player.round;
    } else if (player.round) {
      /**
       * Currently user limited to take a part in single round.
       * Could be improved to let user participate in few Rounds simultaneously.
       * In that case propose to introduce Game entity with relation 'round.game -> game.id'.
       */
      throw new BadRequestException(
        'user already taking a part in another round',
      );
    }

    const round = new Round(this.secretNumber.getSecretNumber());
    //that would redefine player.activeRound
    round.players.add(player);
    for (let idx = 0; idx < ROUND_PLAYERS - 1; idx++) {
      round.players.add(new Player(PlayerType.COMPUTER));
    }
    //commit transaction
    await this.roundRepo.persistAndFlush(round);
    this.eventEmitter.emit(RoundEvents.CREATED, round);
    return round;
  }

  /**
   * Start a round for specified players
   *
   * @param players
   */
  public async start(
    round: Round,
    guessedNumbers: Map<Player, number>,
  ): Promise<Round> {
    if (round.state === RoundState.STARTED) {
      //round already running, do nothing
      return round;
    }
    if (round.state !== RoundState.CREATED) {
      throw new BadRequestException("Round couldn't be started");
    }
    //to ensure round.players.getItems() would be filled with loaded data
    await round.players.init();
    round.players.getItems().forEach((player) => {
      //deduct 10 credits for each player
      player.credit -= ROUND_PARTICIPATION_CREDIT;
      if (!guessedNumbers.has(player)) {
        throw new BadRequestException(
          'All players must provide their guess number',
        );
      }
      //store guessed number for each player
      round.guessedNumbers.set(player._id, guessedNumbers.get(player)!);
    });
    round.state = RoundState.STARTED;
    //commit transaction
    await this.roundRepo.persistAndFlush(round);
    this.eventEmitter.emit(RoundEvents.CREATED, round);
    return round;
  }

  /**
   * End round, distribute prizes.
   *
   * @param players
   */
  public async finish(round: Round) {
    if (round.state === RoundState.FINISHED) {
      //round already finished, do nothing
      return;
    }
    if (round.state !== RoundState.STARTED) {
      throw new BadRequestException("Round couldn't be finished");
    }
    //to ensure round.players.getItems() would be filled with loaded data
    await round.players.init();
    //calculate and distribute prizes
    round.players.getItems().forEach((player) => {
      if (!player.round.guessedNumbers.has(player._id)) {
        throw new InternalServerErrorException(
          "Wrong round's shape on previous step: all players must provide their guess number",
        );
      }
      if (
        player.round.guessedNumbers.get(player._id)! < player.round.secretNumber
      ) {
        const delta =
          player.round.secretNumber -
          player.round.guessedNumbers.get(player._id)!;
        player.credit += ROUND_PARTICIPATION_CREDIT * delta;
      }
    });
    round.state = RoundState.FINISHED;
    //commit transaction
    await this.roundRepo.persistAndFlush(round);
    this.eventEmitter.emit(RoundEvents.CREATED, round);
    return round;
  }

  /**
   * Automatically finish round, since user already sent his guess number and computer players answers
   * was calculated in same moment.
   *
   * UI would get 2 consequent events: 'round.started' and 'round.finished' too fast./
   * So on UI side it's better to slow down (throttle) and show
   */
  @OnEvent(RoundEvents.STARTED, { async: true, promisify: true })
  async handleOrderStartedEvent(round: Round): Promise<void> {
    await this.finish(round);
  }
}
