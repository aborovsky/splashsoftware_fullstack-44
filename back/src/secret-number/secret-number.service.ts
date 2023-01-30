import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';

/**
 * Could be moved to configuration config/game GameAppConfigModule.
 * To load these values from Env params.
 */

/**
 * Secret number always would be less than MAX_SECRET_NUMBER by SECRET_NUMBER_STEP, i.e.: <= MAX_SECRET_NUMBER - SECRET_NUMBER_STEP
 */
export const MAX_SECRET_NUMBER_EXCLUSIVE = 10;
export const SECRET_NUMBER_STEP = 0.01;

@Injectable()
export class SecretNumberService {
  /**
   * Function to get next number to be guessed during round.
   * @returns {number} random float number in range [0, MAX_SECRET_NUMBER_EXCLUSIVE), which is multiple of SECRET_NUMBER_STEP
   */
  public getSecretNumber(): number {
    return new BigNumber(Math.random())
      .multipliedBy(MAX_SECRET_NUMBER_EXCLUSIVE)
      .dividedToIntegerBy(SECRET_NUMBER_STEP)
      .multipliedBy(SECRET_NUMBER_STEP)
      .toNumber();
  }

  /**
   * Function to get number which is computer player guess. Works as getSecretNumber(), but separated to implement advanced logic.
   * @returns {number} random float number in range [0, MAX_SECRET_NUMBER_EXCLUSIVE), which is multiple of SECRET_NUMBER_STEP
   */
  public getComputerPlayerGuess(): number {
    return this.getSecretNumber();
  }
}
