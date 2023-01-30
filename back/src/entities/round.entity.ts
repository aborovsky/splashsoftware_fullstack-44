import { Collection, Entity, Enum, OneToMany, Property } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Player } from './player.entity';

export enum RoundState {
  CREATED,
  STARTED,
  FINISHED,
}

export enum RoundEvents {
  CREATED = 'round.created',
  STARTED = 'round.started',
  FINISHED = 'round.finished',
}

export type RoundId = ObjectId;

@Entity()
export class Round {
  constructor(secretNumber: number) {
    this.secretNumber = secretNumber;
  }

  @Property({ primary: true })
  _id: RoundId;

  @Property()
  secretNumber: number;

  @Property({ autoincrement: true, default: 1 })
  num!: number;

  @Enum(() => RoundState)
  state!: RoundState;

  @OneToMany(() => Player, (player) => player.round, { hidden: true })
  players = new Collection<Player>(this);

  @Property()
  guessedNumbers: Map<ObjectId, number>;
}
