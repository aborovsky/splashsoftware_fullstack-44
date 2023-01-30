import {
  Collection,
  Entity,
  Enum,
  ManyToMany,
  Property,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Player } from './player.entity';
import { Round, RoundId, RoundState } from './round.entity';

@Entity()
export class RoundArchive extends Round {
  constructor(round: Round) {
    super(round.secretNumber);
    this._id = round._id;
    this.secretNumber = round.secretNumber;
    this.num = round.num;
    if (round.state !== RoundState.FINISHED) {
      throw new Error('Only finished round could be archived');
    }
    //"clone" players and guessedNumbers since they could be changed later before this RoundArchive would be persisted
    this.players.set(round.players.getItems());
    this.guessedNumbers = new Map(round.guessedNumbers);
  }

  @Property({ primary: true })
  _id: RoundId;

  @Property()
  secretNumber: number;

  @Property({ autoincrement: true, default: 1 })
  num!: number;

  @Enum({ items: () => RoundState, default: RoundState.FINISHED })
  state: RoundState = RoundState.FINISHED;

  @ManyToMany(() => Player)
  players = new Collection<Player>(this);

  @Property()
  guessedNumbers: Map<ObjectId, number>;
}
