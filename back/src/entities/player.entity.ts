import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Round, RoundState } from './round.entity';

export enum PlayerType {
  REAL_USER,
  COMPUTER,
}

export type PlayerId = ObjectId;

@Entity()
export class Player {
  constructor(type: PlayerType) {
    this.type = type;
  }

  @Property({ primary: true })
  _id: PlayerId;

  @Property()
  credit = 0;

  @Enum(() => PlayerType)
  type: PlayerType;

  /**
   * One single round user taking a part currently.
   * Could be empty when user not yet started to play or previous round was finished and "archived"
   */
  @ManyToOne({ nullable: true })
  round: Round;
}
