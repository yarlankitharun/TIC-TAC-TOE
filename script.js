const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");

const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = false;
let mode = null;
let difficulty = "easy";
let scores = { X: 0, O: 0 };

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function selectMode(selectedMode) {
  mode = selectedMode;
  gameActive = true;
  document.getElementById("difficultySelect").style.display = mode === "cpu" ? "block" : "none";
  resetBoard();
}

function setDifficulty(level) {
  difficulty = level;
  statusText.textContent = `${currentPlayer}'s Turn`;
}

function cellClick(e) {
  const i = e.target.dataset.index;
  if (board[i] !== "" || !gameActive) return;
  makeMove(i);
  if (mode === "cpu" && gameActive && currentPlayer === "O") {
    setTimeout(() => {
      let move = difficulty === "easy" ? easyMove() : bestMove();
      makeMove(move);
    }, 500);
  }
}

function makeMove(index) {
  board[index] = currentPlayer;
  cells[index].textContent = currentPlayer;
  clickSound.play();
  checkResult();
}

function checkResult() {
  for (let [a,b,c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      statusText.textContent = `🎉 Player ${currentPlayer} wins! 🎉`;
      gameActive = false;
      currentPlayer === "X" ? winSound.play() : loseSound.play();
      scores[currentPlayer]++;
      updateScore();
      return;
    }
  }

  if (!board.includes("")) {
    statusText.textContent = "It's a Draw!";
    gameActive = false;
    loseSound.play();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `${currentPlayer}'s Turn`;
}

function easyMove() {
  let empty = board.map((val, i) => val === "" ? i : null).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function bestMove() {
  let bestScore = -Infinity;
  let move;
  board.forEach((val, i) => {
    if (val === "") {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  });
  return move;
}

function minimax(board, depth, isMaximizing) {
  let winner = checkWinnerForAI();
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (!board.includes("")) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    board.forEach((val, i) => {
      if (val === "") {
        board[i] = "O";
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = "";
      }
    });
    return best;
  } else {
    let best = Infinity;
    board.forEach((val, i) => {
      if (val === "") {
        board[i] = "X";
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = "";
      }
    });
    return best;
  }
}

function checkWinnerForAI() {
  for (let [a,b,c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  return null;
}

function restartGame() {
  resetBoard();
  statusText.textContent = `${currentPlayer}'s Turn`;
}

function resetBoard() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  cells.forEach(cell => cell.textContent = "");
}

function resetScore() {
  scores = { X: 0, O: 0 };
  updateScore();
  restartGame();
  statusText.textContent = "Score Reset!";
}

function updateScore() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
}

cells.forEach(cell => cell.addEventListener("click", cellClick));
