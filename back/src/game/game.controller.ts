import { Controller } from '@nestjs/common';
import { Player, PlayerId } from '../entities/player.entity';
import { PlayerService } from '../player/player.service';
import { RoundService } from '../round/round.service';
import { SecretNumberService } from '../secret-number/secret-number.service';

@Controller('game')
export class GameController {
  constructor(
    private readonly playerService: PlayerService,
    private readonly roundService: RoundService,
    private readonly secretNumberService: SecretNumberService,
  ) {}

  public async startRound(playerId?: PlayerId): Promise<Player> {
    const player = await this.playerService.findOrCreate(playerId);
    await this.roundService.create(player);
    return player;
  }

  public async guess(playerId: PlayerId, guessedNumber: number): Promise<void> {
    const player = await this.playerService.find(playerId);
    const guessedNumbers: Map<Player, number> = new Map();
    player.round.players
      .getItems()
      .forEach((player) =>
        player._id.equals(playerId)
          ? player.round.guessedNumbers.set(player._id, guessedNumber)
          : player.round.guessedNumbers.set(
              player._id,
              this.secretNumberService.getComputerPlayerGuess(),
            ),
      );
    await this.roundService.start(player.round, guessedNumbers);
  }
}
