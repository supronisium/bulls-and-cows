import {
  countPossibleSecrets,
  evaluateGuess,
  generateSecret,
  isValidGuess,
  type RandomSource,
  type Score,
} from './game.js';

export type GameStatus = 'playing' | 'won';
export type HistoryEntry = Readonly<{ guess: string; score: Score }>;
export type GameState = Readonly<{
  length: number;
  base: number;
  secret: string;
  history: readonly HistoryEntry[];
  status: GameStatus;
}>;

export const createGame = (
  length: number,
  base: number,
  random: RandomSource = Math.random,
): GameState => ({
  length,
  base,
  secret: generateSecret(length, base, random),
  history: [],
  status: 'playing',
});

export const submitGuess = (state: GameState, guess: string): GameState => {
  if (state.status !== 'playing' || !isValidGuess(guess, state.length, state.base)) {
    return state;
  }

  const normalizedGuess = guess.toLowerCase();
  const score = evaluateGuess(state.secret, normalizedGuess);
  const entry: HistoryEntry = { guess: normalizedGuess, score };

  return {
    ...state,
    history: [...state.history, entry],
    status: score.bulls === state.length ? 'won' : 'playing',
  };
};

export const getPossibilityLabel = (length: number, base: number): string =>
  `${countPossibleSecrets(length, base).toLocaleString('ru-RU')} вариантов`;
