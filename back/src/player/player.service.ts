import { BadRequestException, Injectable } from '@nestjs/common';
import { Player, PlayerId, PlayerType } from '../entities/player.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepo: EntityRepository<Player>,
  ) {}

  public async findOrCreate(playerId?: PlayerId): Promise<Player> {
    let player: Player;
    if (!playerId) {
      //only real user able to call this method through websockets
      player = new Player(PlayerType.REAL_USER);
      await this.playerRepo.persistAndFlush(player);
      return player;
    } else {
      try {
        return await this.find(playerId);
      } catch (e) {
        throw new BadRequestException('Player for such id was not found', e);
      }
    }
  }

  public async find(playerId: PlayerId): Promise<Player> {
    return this.playerRepo.findOneOrFail(playerId, {
      populate: ['round', 'round.players'],
    });
  }
}
