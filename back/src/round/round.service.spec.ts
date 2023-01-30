import { Test, TestingModule } from '@nestjs/testing';
import { RoundService } from './round.service';
import { SecretNumberService } from '../secret-number/secret-number.service';
import { Player } from '../entities/player.entity';
import { EntityRepository } from '@mikro-orm/core';
import { Round } from '../entities/round.entity';
import { RoundArchive } from '../entities/round-archive.entity';

describe('RoundService', () => {
  let service: RoundService;
  let playerRepo: EntityRepository<Player>;
  let roundRepo: EntityRepository<Round>;
  let roundArchiveRepo: EntityRepository<RoundArchive>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecretNumberService, RoundService],
    })
      .useMocker((token) => {
        if (token === 'PlayerRepository') {
          playerRepo = {} as EntityRepository<Player>;
          return playerRepo;
        }
        if (token === 'RoundRepository') {
          roundRepo = {} as EntityRepository<Round>;
          return roundRepo;
        }
        if (token === 'RoundArchiveRepository') {
          roundArchiveRepo = {} as EntityRepository<RoundArchive>;
          return roundArchiveRepo;
        }
      })
      .compile();

    service = module.get<RoundService>(RoundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //TODO: cover RoundService methods with tests, mocking data repositories

  // it('getRoundForPlayer should create new round', () => {
  //
  //     playerRepo['findOne'] = jest.fn().mockResolvedValue()
  //
  //   const player = new Player(PlayerType.REAL_USER);
  //   service.getRoundForPlayer(player);
  //   expect(service).toBeDefined();
  // });
});
