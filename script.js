const board = Array(9).fill(null);
const human = 'X';
const ai = 'O';
const cells = document.querySelectorAll('.cell');
const restartButton = document.getElementById('restart');
const statusText = document.getElementById('status');
const easyModeButton = document.getElementById('easy-mode');
const hardModeButton = document.getElementById('hard-mode');

let isHardMode = true;

cells.forEach(cell => cell.addEventListener('click', onCellClick));
restartButton.addEventListener('click', restartGame);
easyModeButton.addEventListener('click', () => selectDifficulty(false));
hardModeButton.addEventListener('click', () => selectDifficulty(true));

function selectDifficulty(hardMode) {
    isHardMode = hardMode;
    restartGame();
    statusText.textContent = isHardMode ? 'Hard Mode Selected' : 'Easy Mode Selected';
}

function onCellClick(event) {
    const index = event.target.dataset.index;
    if (board[index] || checkWinner(board)) return;

    board[index] = human;
    event.target.textContent = human;

    if (!checkWinner(board) && board.includes(null)) {
        const aiMove = isHardMode ? getBestMove(board) : getRandomMove(board);
        board[aiMove] = ai;
        cells[aiMove].textContent = ai;
    }

    const winner = checkWinner(board);
    if (winner) {
        statusText.textContent = winner.winner === human ? "You won!" : "Computer won!";
        highlightWinningCells(winner.pattern, winner.winner);
    }
    
    else if (!board.includes(null)) {
        statusText.textContent = "It's a draw!";
    }
}


function getRandomMove(board) {
    const emptyCells = board.map((val, index) => val === null ? index : null).filter(val => val !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getBestMove(board) {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = ai;
            let score = minimax(board, 0, false);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    const result = checkWinner(board);
    if (result) return result.winner === ai ? 10 - depth : depth - 10;
    if (!board.includes(null)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = ai;
                let score = minimax(board, depth + 1, false);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = human;
                let score = minimax(board, depth + 1, true);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], pattern };
        }
    }
    return null;
}

function highlightWinningCells(pattern, winner) {
    const className = winner === human ? 'winning-cell-human' : 'winning-cell-ai';
    pattern.forEach(index => {
        cells[index].classList.add(className);
    });
}

function restartGame() {
    board.fill(null);
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning-cell-human', 'winning-cell-ai');
        cell.style.backgroundColor = ''; // Reset the background color
    });
    statusText.textContent = '';
}
