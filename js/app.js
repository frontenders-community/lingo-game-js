// Game info
const MAX_GUESSES = {
  5: 5,
  6: 6,
  7: 7,
  8: 6,
}
const COUNTDOWN_STEP = 15;
let allWordsArr = [];
let difficulty = -1;
let word = "";
let wordMap = {};
let guessCount = 0;
let userWord = "";
let endGame = false;
let hasWin = false;
let countdownInterval = null;

function showWord() {
  const board = document.getElementById("board");
  const row = document.createElement("div");
  row.classList.add("row");
  for(let j = 0; j < difficulty; j++) {
    const square = document.createElement("div");
    square.classList.add("square", "empty");
    square.innerText = word[j];
    row.appendChild(square);
  }
  board.appendChild(row);
}

function generateBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  for(let i = 0; i < MAX_GUESSES[word.length]; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    row.id = `row:${i}`;

    for(let j = 0; j < difficulty; j++) {
      const square = document.createElement("div");
      square.classList.add("square", "empty");

      // Create first line with initial char
      if (i === guessCount) {
        if (j === 0) {
          square.innerText = word[j];
        } else {
          square.innerText = ".";
        }
      }
      row.appendChild(square);
    }
    board.appendChild(row);
  }
}

function nextGuess() {
  guessCount++;

  if (guessCount < MAX_GUESSES[word.length]) {
    generateCharMap();

    const row = document.getElementById(`row:${guessCount}`);
    for (let i = 0; i < row.children.length; i++) {
      if (i === 0 && userWord[0] !== word[0]) {
        row.children[i].innerText = word[0];
      } else {
        row.children[i].innerText = userWord[i];
      }
    }

    startCountdown();
  } else {
    endGame = true;
    showWord();
    handleEndGame();
  }
}

function showError(guess) {
  const row = document.getElementById(`row:${guessCount}`);
  for (let i = 0; i < row.children.length; i++) {
    row.children[i].innerText = guess[i] || ".";
    row.children[i].classList.add("error");
  }
}

function guess() {
  const input = document.getElementById("word-input");
  const guess = input.value;
  input.value = "";

  if (endGame || guess === "") {
    return;
  }

  if (guess.length < difficulty || guess.length > difficulty) {
    showError(guess);
    nextGuess();
    return;
  }

  const row = document.getElementById(`row:${guessCount}`);

  // check for char in correct position
  let correctChars = 0;
  for(let i = 0; i < word.length; i++) {
    if (guess[i] === word[i]) {
      row.children[i].classList.add('correct');
      userWord[i] = guess[i];
      wordMap[guess[i]]--;
      correctChars++;
    }

    row.children[i].innerText = guess[i];
  }
  if (correctChars === word.length) {
    hasWin = true;
    endGame = true;
  }
  
  // check for chars included but in wrong position
  for(let i = 0; i < word.length; i++) {
    if (word.includes(guess[i]) && guess[i] !== word[i]) {
      if (wordMap.hasOwnProperty(guess[i]) && wordMap[guess[i]] >= 1) {
        row.children[i].classList.add('wrong');
        wordMap[guess[i]]--;
      }
    }
  }

  if (!endGame) nextGuess();
  else handleEndGame();
}

function handleEndGame() {
  resetCountdown();
  document.getElementById("word-input").disabled = true;
  document.getElementById("guess-btn").disabled = true;
  document.getElementById("next-btn").style.display = "block";
  document.getElementById("next-btn").addEventListener("click", function() {
    document.getElementById("word-input").disabled = false;
    document.getElementById("guess-btn").disabled = false;
    
    createLingo();

    this.style.display = "none";
  })
}

function generateCharMap() {
  wordMap = {};
  // Generate a map of chars occurrencies of the word to guess
  for (let i = 0; i < word.length; i++) {
    if (wordMap.hasOwnProperty(word[i])) {
      wordMap[word[i]]++;
    } else {
      wordMap[word[i]] = 1;
    }
  }
}

function resetCountdown() {
  clearInterval(countdownInterval);
  document.getElementById("countdown").style.width = "100%";
}

function startCountdown() {
  resetCountdown();
  
  countdownInterval = setInterval(() => {
    const countdown = document.getElementById("countdown");
    const newValue = countdown.offsetWidth - COUNTDOWN_STEP;
    countdown.style.width = `${newValue}px`;

    if (countdown.offsetWidth === COUNTDOWN_STEP) {
      clearInterval(countdownInterval);
      nextGuess();
    }
  }, 1000);
}

function createLingo() {
  const randomWord = pickRandomWord(allWordsArr);

  difficulty = randomWord.length;
  word = randomWord;
  userWord = ".".repeat(difficulty).split("");

  guessCount = 0;
  endGame = false;
  hasWin = false;
 
  generateCharMap();
  generateBoard();
  startCountdown();
}

function pickRandomWord(allWords) {
  const randomIdx = Math.floor(Math.random() * allWords.length);
  const random = allWords[randomIdx];
  // console.log(randomIdx, random);

  return random;
}

async function main() {
  const wordsResponse = await (await fetch("../words.txt")).text();
  allWordsArr = wordsResponse.split("\n");

  document.getElementById("word-input").addEventListener("keyup", function(e) {
    if(e.key === 'Enter') {
      guess();
    }
  });
  
  document.getElementById("guess-btn").addEventListener("click", guess);
  
  createLingo();
}