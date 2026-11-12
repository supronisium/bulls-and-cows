import { createDigitValidator } from './game.js';
import { createGame, getPossibilityLabel, submitGuess, type GameState } from './state.js';

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Element #${id} was not found`);
  return element as T;
};

const lengthSelect = byId<HTMLSelectElement>('length');
const baseSelect = byId<HTMLSelectElement>('base');
const guessInput = byId<HTMLInputElement>('guess');
const guessForm = byId<HTMLFormElement>('guess-form');
const newGameButton = byId<HTMLButtonElement>('new-game');
const message = byId<HTMLParagraphElement>('message');
const historyElement = byId<HTMLDivElement>('history');
const historyEmpty = byId<HTMLDivElement>('history-empty');
const attemptCount = byId<HTMLSpanElement>('attempt-count');
const possibilities = byId<HTMLSpanElement>('possibilities');
const inputHint = byId<HTMLParagraphElement>('input-hint');
const submitButton = guessForm.querySelector('button');

let state: GameState;

const render = (): void => {
  historyElement.replaceChildren();
  historyEmpty.hidden = state.history.length > 0;
  attemptCount.textContent = `${state.history.length} ${pluralizeAttempts(state.history.length)}`;

  state.history.forEach(({ guess, score }, index) => {
    const row = document.createElement('div');
    row.className = 'history-row';

    const number = document.createElement('span');
    number.className = 'number';
    number.textContent = `#${index + 1}`;

    const digits = document.createElement('span');
    digits.className = 'digits';
    digits.textContent = guess.toUpperCase();

    const bulls = document.createElement('span');
    bulls.className = 'score';
    bulls.innerHTML = `<strong>${score.bulls}</strong> bulls`;

    const cows = document.createElement('span');
    cows.className = 'score cows';
    cows.innerHTML = `<strong>${score.cows}</strong> cows`;

    row.append(number, digits, bulls, cows);
    historyElement.append(row);
  });

  const finished = state.status === 'won';
  guessInput.disabled = finished;
  if (submitButton instanceof HTMLButtonElement) submitButton.disabled = finished;
  if (finished) {
    message.textContent = `Победа! Вы угадали ${state.secret.toUpperCase()} за ${state.history.length} ${pluralizeAttempts(state.history.length)}.`;
    message.className = 'message success';
  }
};

const pluralizeAttempts = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'попытка';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'попытки';
  return 'попыток';
};

const startGame = (): void => {
  const length = Number(lengthSelect.value);
  const base = Number(baseSelect.value);
  state = createGame(length, base);
  guessInput.value = '';
  guessInput.maxLength = length;
  guessInput.disabled = false;
  if (submitButton instanceof HTMLButtonElement) submitButton.disabled = false;
  message.textContent = 'Компьютер загадал число. Поехали!';
  message.className = 'message';
  inputHint.textContent = `Введите ${length} уникальных символа из диапазона 0–${'0123456789abcdefghijklmnopqrstuvwxyz'[base - 1].toUpperCase()}.`;
  possibilities.textContent = getPossibilityLabel(length, base);
  render();
};

guessInput.addEventListener('input', () => {
  const validator = createDigitValidator(state.base);
  const filtered = [...guessInput.value]
    .filter((char) => validator(char))
    .slice(0, state.length)
    .join('')
    .toLowerCase();
  guessInput.value = [...new Set(filtered)].join('');
});

guessForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const guess = guessInput.value.trim();
  if (guess.length !== state.length) {
    message.textContent = `Нужно ввести ровно ${state.length} символа.`;
    message.className = 'message error';
    return;
  }

  const nextState = submitGuess(state, guess);
  if (nextState === state) {
    message.textContent = 'Проверьте ввод: цифры должны быть допустимыми и не повторяться.';
    message.className = 'message error';
    return;
  }

  state = nextState;
  guessInput.value = '';
  if (state.status !== 'won') {
    const last = state.history[state.history.length - 1];
    message.textContent = `Bulls: ${last.score.bulls} · Cows: ${last.score.cows}`;
    message.className = 'message';
  }
  render();
});

newGameButton.addEventListener('click', startGame);
lengthSelect.addEventListener('change', startGame);
baseSelect.addEventListener('change', () => {
  const maxLength = Number(baseSelect.value);
  [...lengthSelect.options].forEach((option) => {
    option.disabled = Number(option.value) > maxLength;
  });
  if (Number(lengthSelect.value) > maxLength) lengthSelect.value = String(maxLength);
  startGame();
});

startGame();
