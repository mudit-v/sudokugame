class SudokuGame {
	constructor(containerSelector) {
		this.container = document.querySelector(containerSelector);
		this.header = {
			timerDisplay: document.getElementById('timer-display'),
			newGameBtn: document.getElementById('new-game-btn')
		};

		this.config = {
			levels: [
				{ name: "Easy", numbers: 45 },
				{ name: "Medium", numbers: 35 },
				{ name: "Hard", numbers: 25 }
			],
			gridSize: 9, boxSize: 3, storageKey: 'sudokuGameState'
		};

		this.state = {
			solutionMatrix: [],
			gameMatrix: [],
			level: 40,
			selectedCell: null,
			timerInterval: null,
			timeElapsed: 0
		};

		this._init();
	}

	_init() {
		this.container.innerHTML = '';
		this.header.newGameBtn.addEventListener('click', () => this._startNewGame(true));
		window.addEventListener('keydown', (e) => this._handleKeyDown(e));

		const savedGame = localStorage.getItem(this.config.storageKey);
		if (savedGame) {
			if (confirm("Continue your previous game?")) {
				this._loadGameState(JSON.parse(savedGame));
			} else {
				this._startNewGame(true);
			}
		} else {
			this._createDiffPicker();
		}
	}

	// --- Game Setup & State Management ---
	_startNewGame(clearStorage) {
		if(clearStorage) localStorage.removeItem(this.config.storageKey);
		this._stopTimer();
		this.container.innerHTML = '';
		this._createDiffPicker();
	}

	_loadGameState(savedState) {
		this.state = { ...this.state, ...savedState };
		this._startGame(false); // isNew = false
		this._startTimer();
	}

	_saveGameState() {
		const stateToSave = {
			solutionMatrix: this.state.solutionMatrix,
			gameMatrix: this.state.gameMatrix,
			level: this.state.level,
			timeElapsed: this.state.timeElapsed
		};
		localStorage.setItem(this.config.storageKey, JSON.stringify(stateToSave));
	}

	// --- Timer Functionality ---
	_startTimer() {
		if (this.state.timerInterval) clearInterval(this.state.timerInterval);
		const startTime = Date.now() - this.state.timeElapsed * 1000;
		this.state.timerInterval = setInterval(() => {
			this.state.timeElapsed = Math.floor((Date.now() - startTime) / 1000);
			this.header.timerDisplay.textContent = this._formatTime(this.state.timeElapsed);
		}, 1000);
	}

	_stopTimer() { clearInterval(this.state.timerInterval); }
	_formatTime(seconds) {
		const min = Math.floor(seconds / 60);
		const sec = seconds % 60;
		return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
	}

	// --- Matrix Generation ---
	_createSolutionMatrix() {
		let matrix = Array.from({ length: this.config.gridSize }, () => Array(this.config.gridSize).fill(0));
		for (let r = 0; r < this.config.gridSize; r++) {
			for (let c = 0; c < this.config.gridSize; c++) {
				const num = (c + 1) + (r * this.config.boxSize) + Math.floor(r / this.config.boxSize) % this.config.boxSize;
				matrix[r][c] = num > this.config.gridSize ? num % this.config.gridSize : num;
			}
		}
		for (let i = 0; i < this.config.gridSize; i += this.config.boxSize) {
			let tempMatrix = matrix;
			this._shuffleArray(tempMatrix, i, i + this.config.boxSize - 1);
			let transposed = this._transpose(tempMatrix);
			this._shuffleArray(transposed, i, i + this.config.boxSize - 1);
			matrix = this._transpose(transposed);
		}
		return matrix;
	}
	_shuffleArray(matrix, start, end) {
		for (let i = end; i > start; i--) {
			const j = Math.floor(Math.random() * (i - start + 1)) + start;
			[matrix[i], matrix[j]] = [matrix[j], matrix[i]];
		}
	}
	_transpose(matrix) { return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex])); }

	// --- UI Creation ---
	_createDiffPicker() {
		this.container.innerHTML = '';
		const picker = document.createElement('div');
		picker.className = 'sdk-picker sdk-no-show';
		this.config.levels.forEach(level => {
			const btn = document.createElement('div');
			btn.className = 'sdk-btn';
			btn.textContent = level.name;
			btn.dataset.level = level.numbers;
			picker.appendChild(btn);
		});
		picker.addEventListener('click', (event) => {
			if (event.target.classList.contains('sdk-btn')) {
				picker.classList.add('sdk-no-show');
				this.state.level = parseInt(event.target.dataset.level);
				setTimeout(() => this._startGame(true), 1000);
			}
		});
		this.container.appendChild(picker);
		setTimeout(() => picker.classList.remove('sdk-no-show'), 100);
	}

	_startGame(isNew = true) {
		if(isNew) {
			this.state.solutionMatrix = this._createSolutionMatrix();
			this.state.gameMatrix = this._createGameMatrix();
			this.state.timeElapsed = 0;
		}
		this._createTable();
		this._createAnswerPicker();
		this._validateBoard();
		if(isNew) this._startTimer();
	}

	_createGameMatrix() {
		let gameMatrix = JSON.parse(JSON.stringify(this.state.solutionMatrix)); // Deep copy
		let cellsToRemove = this.config.gridSize * this.config.gridSize - this.state.level;

		while (cellsToRemove > 0) {
			let r = Math.floor(Math.random() * this.config.gridSize);
			let c = Math.floor(Math.random() * this.config.gridSize);
			if (gameMatrix[r][c] !== 0) {
				gameMatrix[r][c] = 0;
				cellsToRemove--;
			}
		}
		return gameMatrix;
	}

	_createTable() {
		this.container.innerHTML = '';
		const table = document.createElement('div');
		table.className = 'sdk-table sdk-no-show';

		for (let r = 0; r < this.config.gridSize; r++) {
			for (let c = 0; c < this.config.gridSize; c++) {
				const cell = document.createElement('div');
				cell.className = 'sdk-col';
				cell.dataset.row = r;
				cell.dataset.col = c;
				if ((Math.floor(r / this.config.boxSize) + Math.floor(c / this.config.boxSize)) % 2 === 0) {
					cell.classList.add('is-shaded');
				}
				const number = this.state.gameMatrix[r][c];
				const isPrefilled = this.state.solutionMatrix[r][c] === number && number !== 0;
				if (isPrefilled) cell.classList.add('is-prefilled');

				this._updateCell(cell, number, !isPrefilled);
				cell.addEventListener('click', () => this._onCellClick(cell));
				table.appendChild(cell);
			}
		}
		this.container.appendChild(table);
		setTimeout(() => table.classList.remove('sdk-no-show'), 100);
	}

	_createAnswerPicker() {
		const picker = document.createElement('div');
		picker.className = 'sdk-ans-container';
		for (let i = 1; i <= this.config.gridSize; i++) {
			const btn = document.createElement('div');
			btn.className = 'sdk-btn';
			btn.textContent = i;
			btn.addEventListener('click', () => this._onAnswerClick(i));
			picker.appendChild(btn);
		}
		this.container.appendChild(picker);
	}

	// --- Event Handlers ---
	_onCellClick(cell) {
		document.querySelectorAll('.sdk-col').forEach(c => c.classList.remove('sdk-selected', 'is-highlighted'));
		if (!cell.classList.contains('is-prefilled')) {
			this.state.selectedCell = cell;
			cell.classList.add('sdk-selected');
		}
		const number = parseInt(cell.textContent);
		if (number) {
			document.querySelectorAll('.sdk-col').forEach(c => {
				if (parseInt(c.textContent) === number) {
					c.classList.add('is-highlighted');
				}
			});
		}
	}

	_onAnswerClick(number) {
		if (!this.state.selectedCell) return;
		const { row, col } = this.state.selectedCell.dataset;
		this.state.gameMatrix[row][col] = number;
		this._updateCell(this.state.selectedCell, number, true);
		this._validateBoard();
		this._saveGameState();
		this._checkWinCondition();
	}

	_handleKeyDown(e) {
		if (!this.state.selectedCell && !e.key.startsWith('Arrow')) return;

		if (e.key >= '1' && e.key <= '9') {
			this._onAnswerClick(parseInt(e.key));
		} else if (e.key === 'Backspace' || e.key === 'Delete') {
			if (this.state.selectedCell) {
				const { row, col } = this.state.selectedCell.dataset;
				this.state.gameMatrix[row][col] = 0;
				this._updateCell(this.state.selectedCell, 0, false);
				this._validateBoard();
				this._saveGameState();
			}
		} else if (e.key.startsWith('Arrow')) {
			e.preventDefault();
			const currentCell = this.state.selectedCell || document.querySelector('.sdk-col');
			const { row, col } = currentCell.dataset;
			let newRow = parseInt(row), newCol = parseInt(col);

			if (e.key === 'ArrowUp') newRow = Math.max(0, newRow - 1);
			if (e.key === 'ArrowDown') newRow = Math.min(8, newRow + 1);
			if (e.key === 'ArrowLeft') newCol = Math.max(0, newCol - 1);
			if (e.key === 'ArrowRight') newCol = Math.min(8, newCol + 1);

			const newCell = document.querySelector(`.sdk-col[data-row='${newRow}'][data-col='${newCol}']`);
			if(newCell) this._onCellClick(newCell);
		}
	}

	// --- Game Logic & Validation ---
	_updateCell(cell, number, isUserInput) {
		cell.innerHTML = '';
		if (number !== 0) {
			const solutionDiv = document.createElement('div');
			solutionDiv.className = 'sdk-solution';
			if(isUserInput) solutionDiv.classList.add('is-user-input');
			solutionDiv.textContent = number;
			cell.appendChild(solutionDiv);
		}
	}

	_validateBoard() {
		document.querySelectorAll('.sdk-col').forEach(c => c.classList.remove('has-error'));
		const allCells = document.querySelectorAll('.sdk-col');

		for (let i = 0; i < this.config.gridSize; i++) {
			this._validateGroup(Array.from(allCells).filter(c => c.dataset.row == i)); // Rows
			this._validateGroup(Array.from(allCells).filter(c => c.dataset.col == i)); // Columns
		}
		for (let br = 0; br < this.config.boxSize; br++) {
			for (let bc = 0; bc < this.config.boxSize; bc++) {
				this._validateGroup(Array.from(allCells).filter(c =>
					Math.floor(c.dataset.row / this.config.boxSize) == br &&
					Math.floor(c.dataset.col / this.config.boxSize) == bc
				));
			}
		}
	}

	_validateGroup(group) {
		const seen = new Map();
		group.forEach(cell => {
			const num = parseInt(cell.textContent);
			if (num) {
				if (seen.has(num)) {
					cell.classList.add('has-error');
					seen.get(num).classList.add('has-error');
				}
				seen.set(num, cell);
			}
		});
	}

	_checkWinCondition() {
		const hasEmpty = this.state.gameMatrix.flat().includes(0);
		const hasErrors = !!document.querySelector('.has-error');
		if (!hasEmpty && !hasErrors) {
			this._stopTimer();
			localStorage.removeItem(this.config.storageKey);
			setTimeout(() => {
				alert(`🎉 Congratulations! You solved it in ${this._formatTime(this.state.timeElapsed)}!`);
				this._startNewGame(false);
			}, 100);
		}
	}
}

// --- Start the game ---
document.addEventListener('DOMContentLoaded', () => { new SudokuGame('.sudoku-game'); });