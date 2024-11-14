const svgX = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="60" height="60"><line x1="10" y1="10" x2="90" y2="90" stroke="#333333" stroke-width="10"/><line x1="90" y1="10" x2="10" y2="90" stroke="#333333" stroke-width="10"/></svg>';
const svgO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="60" height="60"><circle cx="50" cy="50" r="40" stroke="#333333" stroke-width="10" fill="none"/></svg>';

const board = Array(9).fill(null);
const human = 'X';
const ai = 'O';
const cells = document.querySelectorAll('.cell');
const restartButton = document.getElementById('restart');
const statusText = document.getElementById('status');
const easyModeButton = document.getElementById('easy-mode');
const hardModeButton = document.getElementById('hard-mode');

let isHardMode = null;
let isPlayerTurn = true; // Flag to track if it's the player's turn

cells.forEach(cell => cell.addEventListener('click', onCellClick));
restartButton.addEventListener('click', restartGame);
easyModeButton.addEventListener('click', () => selectDifficulty(false));
hardModeButton.addEventListener('click', () => selectDifficulty(true));

function selectDifficulty(hardMode) {
    isHardMode = hardMode;
    restartGame(false); // Pass false to not reset the background color
    statusText.textContent = isHardMode ? 'Hard Mode Selected' : 'Easy Mode Selected';
    // Update the background color based on selected difficulty
    if (isHardMode) {
        document.body.classList.add('hard-mode');
        document.body.classList.remove('easy-mode');
    } else {
        document.body.classList.add('easy-mode');
        document.body.classList.remove('hard-mode');
    }
}

function onCellClick(event) {
    const index = event.target.dataset.index;

    // Player's turn - make move only if cell is empty and it's the player's turn
    if (!isPlayerTurn || board[index] || checkWinner(board) || isHardMode === null) return;

    // Human's move
    board[index] = human;
    event.target.innerHTML = svgX; // Apply SVG X for styling

    const winner = checkWinner(board);
    if (winner) {
        statusText.textContent = winner.winner === human ? "You won!" : "Computer won!";
        highlightWinningCells(winner.pattern, winner.winner);
        return;
    }

    // After player's move, switch turn and wait for AI
    isPlayerTurn = false;
    statusText.textContent = "Computer is making a move...";

    // AI's move with a delay (500 ms)
    setTimeout(() => {
        aiMove();
    }, 500); // 500ms delay for AI's move
}

function aiMove() {
    if (board.includes(null)) {
        const aiMove = isHardMode ? getBestMove(board) : getRandomMove(board);
        board[aiMove] = ai;
        cells[aiMove].innerHTML = svgO; // Apply SVG O for styling
    }

    // Check for winner after AI's move
    const updatedWinner = checkWinner(board);
    if (updatedWinner) {
        statusText.textContent = updatedWinner.winner === human ? "You won!" : "Computer won!";
        highlightWinningCells(updatedWinner.pattern, updatedWinner.winner);
    } else if (!board.includes(null)) {
        statusText.textContent = "It's a draw!";
    }

    // After AI's move, it's the player's turn again
    isPlayerTurn = true;
    if (!checkWinner(board) && board.includes(null)) {
        statusText.textContent = "Your turn!";
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

function restartGame(resetStatus = true) {
    board.fill(null);
    cells.forEach(cell => {
        cell.innerHTML = ''; // Clear symbols
        cell.classList.remove('winning-cell-human', 'winning-cell-ai');
    });

    if (resetStatus) {
        statusText.textContent = 'Your turn!'; // Reset message to "Your turn!"
    }

    // Don't reset difficulty mode
    if (isHardMode !== null) {
        statusText.textContent = isHardMode ? 'Hard Mode Selected' : 'Easy Mode Selected';
    }
}
