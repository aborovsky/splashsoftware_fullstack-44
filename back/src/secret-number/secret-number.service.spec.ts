import { Test, TestingModule } from '@nestjs/testing';
import {
  MAX_SECRET_NUMBER_EXCLUSIVE,
  SECRET_NUMBER_STEP,
  SecretNumberService,
} from './secret-number.service';
import BigNumber from 'bignumber.js';

/**
 * Unit tests for SecretNumberService
 */
describe('GuessNumberService', () => {
  let service: SecretNumberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecretNumberService],
    }).compile();

    service = module.get<SecretNumberService>(SecretNumberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getSecretNumber should return a number', () => {
    expect(typeof service.getSecretNumber()).toBe('number');
  });

  it('getSecretNumber should return non NaN', () => {
    expect(service.getSecretNumber()).not.toBeNaN();
  });

  it('getSecretNumber should return positive number', () => {
    expect(service.getSecretNumber()).toBeGreaterThanOrEqual(0);
  });

  it('getSecretNumber should return number which is multiple of SECRET_NUMBER_STEP', () => {
    const sn = service.getSecretNumber();
    const remainder = new BigNumber(sn).modulo(SECRET_NUMBER_STEP);
    try {
      expect(remainder.isZero()).toBe(true);
    } catch (e) {
      throw new Error(
        `Remainder of the division "${remainder}" not eq to 0 for secret number value "${sn}"`,
      );
    }
  });

  it('getSecretNumber should return number less than or equal MAX_SECRET_NUMBER - SECRET_NUMBER_STEP', () => {
    expect(service.getSecretNumber()).toBeLessThanOrEqual(
      MAX_SECRET_NUMBER_EXCLUSIVE - SECRET_NUMBER_STEP,
    );
  });

  /**
   * No reason to test different cases for getComputerPlayerGuess, cause it's a duplicate for getSecretNumber now
   */
  it('getComputerPlayerGuess should return a number', () => {
    expect(typeof service.getComputerPlayerGuess()).toBe('number');
  });
});
