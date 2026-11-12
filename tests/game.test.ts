import { describe, expect, it } from 'vitest';
import {
  countPossibleSecrets,
  createDigitValidator,
  evaluateGuess,
  generateSecret,
  isValidGuess,
} from '../src/game.js';
import { createGame, submitGuess } from '../src/state.js';

describe('generateSecret', () => {
  it('uses the injected random source and preserves leading zeroes', () => {
    const values = [0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999];
    const secret = generateSecret(4, 10, () => values.shift() ?? 0.999);
    expect(secret).toHaveLength(4);
    expect(new Set(secret).size).toBe(4);
    expect(secret[0]).toBe('0');
  });

  it('rejects impossible parameters', () => {
    expect(() => generateSecret(3, 2)).toThrow(RangeError);
  });
});

describe('digit validation', () => {
  it('validates digits for the selected base, case-insensitively', () => {
    const isHexDigit = createDigitValidator(16);
    expect(isHexDigit('A')).toBe(true);
    expect(isHexDigit('f')).toBe(true);
    expect(isHexDigit('g')).toBe(false);
  });

  it('checks length, allowed digits, and uniqueness', () => {
    expect(isValidGuess('01aF', 4, 16)).toBe(true);
    expect(isValidGuess('01aA', 4, 16)).toBe(false);
    expect(isValidGuess('012', 4, 10)).toBe(false);
    expect(isValidGuess('019z', 4, 10)).toBe(false);
  });
});

describe('evaluateGuess', () => {
  it('counts bulls and cows', () => {
    expect(evaluateGuess('4271', '1234')).toEqual({ bulls: 1, cows: 2 });
  });

  it('compares hexadecimal digits without case sensitivity', () => {
    expect(evaluateGuess('aB3f', 'AbF3')).toEqual({ bulls: 2, cows: 2 });
  });
});

describe('countPossibleSecrets', () => {
  it('calculates permutations and allows a leading zero', () => {
    expect(countPossibleSecrets(4, 10)).toBe(5040);
    expect(countPossibleSecrets(2, 2)).toBe(2);
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it('returns zero for impossible parameters', () => {
    expect(countPossibleSecrets(4, 3)).toBe(0);
  });
});

describe('immutable game state', () => {
  it('adds a new history entry without mutating the previous state', () => {
    const initial = createGame(3, 10, () => 0);
    const next = submitGuess(initial, '120');
    expect(next).not.toBe(initial);
    expect(next.history).toHaveLength(1);
    expect(initial.history).toHaveLength(0);
  });

  it('marks the game as won when all digits are bulls', () => {
    const initial = createGame(3, 10, () => 0);
    const won = submitGuess(initial, '012');
    expect(won.status).toBe('won');
  });
});
