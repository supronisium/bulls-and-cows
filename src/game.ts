export const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

export type Score = Readonly<{ bulls: number; cows: number }>;
export type RandomSource = () => number;

/**
 * Creates a case-insensitive predicate for digits valid in the given base.
 * Supported bases are 2 through 36.
 */
export const createDigitValidator = (base: number) => (char: string): boolean => {
  if (!Number.isInteger(base) || base < 2 || base > DIGITS.length || char.length !== 1) {
    return false;
  }

  return DIGITS.slice(0, base).includes(char.toLowerCase());
};

/** Generates a secret as a string so leading zeroes are preserved. */
export const generateSecret = (
  length: number,
  base: number,
  random: RandomSource = Math.random,
): string => {
  if (!Number.isInteger(length) || !Number.isInteger(base) || base < 2 || base > DIGITS.length) {
    throw new RangeError('Base must be an integer from 2 to 36 and length must be an integer.');
  }
  if (length < 1 || length > base) {
    throw new RangeError('Length must be between 1 and base.');
  }

  const shuffled = DIGITS.slice(0, base).split('');

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, length).join('');
};

/** Returns exact-position matches (bulls) and misplaced matches (cows). */
export const evaluateGuess = (secret: string, guess: string): Score => {
  const normalizedSecret = secret.toLowerCase().split('');
  const normalizedGuess = guess.toLowerCase().split('');
  const bulls = normalizedGuess
    .map((digit, index) => digit === normalizedSecret[index])
    .filter(Boolean).length;
  const secretDigits = normalizedSecret.filter((digit) => !normalizedGuess.includes(digit));
  const cows = normalizedGuess.filter(
    (digit, index) => digit !== normalizedSecret[index] && !secretDigits.includes(digit),
  ).length;

  return { bulls, cows };
};

export const isValidGuess = (guess: string, length: number, base: number): boolean => {
  const normalized = guess.toLowerCase().split('');
  const isDigitValid = createDigitValidator(base);

  return (
    normalized.length === length &&
    normalized.every(isDigitValid) &&
    new Set(normalized).size === normalized.length
  );
};

const countMemo = new Map<string, number>();

/** Counts P(base, length), allowing a leading zero. Results are memoized. */
export const countPossibleSecrets = (length: number, base: number): number => {
  if (!Number.isInteger(length) || !Number.isInteger(base) || base < 0 || length < 0 || length > base) {
    return 0;
  }
  if (length === 0) return 1;

  const key = `${length}:${base}`;
  const cached = countMemo.get(key);
  if (cached !== undefined) return cached;

  const result = base * countPossibleSecrets(length - 1, base - 1);
  countMemo.set(key, result);
  return result;
};
