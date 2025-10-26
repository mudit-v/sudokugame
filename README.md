# sudokugame

Modern Sudoku Game

A classic Sudoku game built with modern, dependency-free HTML, CSS, and JavaScript. This project was modernized from an older jQuery-based version to use modern ES6+ classes, CSS Grid, and advanced browser features.

✨ Features

This isn't just a basic Sudoku grid. It includes several advanced features to create a complete and polished user experience:
Three Difficulty Levels: Choose from Easy, Medium, or Hard to automatically generate a new puzzle.
Game Timer: Tracks your solving time from the moment the game starts.
Save Progress: Automatically saves your current game (including the board and timer) to the browser's localStorage. If you close the tab, it will ask if you want to continue.
Full Keyboard Support:
Navigate the grid using the Arrow Keys.
Enter numbers using the 1-9 keys.
Clear a cell using the Backspace or Delete keys.
Real-time Error Highlighting: The game instantly checks every number you enter. Any number that violates Sudoku rules (duplicate in a row, column, or 3x3 box) is highlighted in red with a "shake" animation.
Win Condition: The game automatically detects when the puzzle is correctly and completely filled, stops the timer, and shows a congratulatory message.
Modern & Responsive Design:
Built with CSS Grid for a clean, robust, and responsive layout.
Uses CSS Variables for an easy-to-theme design.
Looks great on both desktop and mobile devices.

🛠️ Technologies Used

This project is built from the ground up with a focus on modern, efficient, and dependency-free web standards.
HTML5: Structured with semantic HTML.
CSS3: Styled with modern CSS, including Grid, Flexbox, Custom Properties (Variables), and Keyframe Animations.
JavaScript (ES6+):
All game logic is encapsulated in a single ES6 Class (SudokuGame).
No libraries or frameworks (like jQuery) are used.
Uses modern browser APIs like localStorage and requestAnimationFrame.
