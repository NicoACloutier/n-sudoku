# n-sudoku

A website for playing generalized `n`-Sudoku. Traditionally, Sudoku is played on a 9-by-9 grid. For the purpose of this website, I term this "3-Sudoku." The rules of Sudoku, however, can be generalized beyond this (as described in the player manual in this document) to any natural number. This website generates and allows users to play 2-, 3-, 4-, and 5-Sudoku in their browsers. The site can be accessed at [nicoacloutier.github.io/n-sudoku](https://nicoacloutier.github.io/n-sudoku). A screenshot of the website is shown below.

![A screenshot of n-sudoku.](/screenshot.png?raw=true "A screenshot of n-sudoku.")

## Player manual

### Rules

#### 3-Sudoku

3-Sudoku is the traditional game of Sudoku. It is played on a board made up by a 3-by-3 grid of boxes, each box made up by a 3-by-3 grid of tiles. The goal of the game is to discover the value of each tile in the board. At the beginning, some tiles will be revealed to the player. There are 9 distinct values in the game. Typically, these are the numbers 1-9, but they can be any distinct set of 9 symbols. It is assumed that the tiles revealed give enough information for the board to have a single solution. The values of the unrevealed tiles can be discovered through a set of rules restricting which value can be placed where.

First, a box must contain all 9 values. Since a box only has 9 tiles, this means that each tile value within a box must be distinct; the same value cannot appear in a box twice. Rows and columns follow the same rule: each one must contain all 9 values. Since both rows and columns in the board have only 9 tiles, each tile within the row or column must contain a distinct value. The idea of the game is that these restrictions can be used by the player to rule out the placement of certain values in certain tiles, until every tile's value is known with certainty. Guessing or trial and error should never be necessary in a properly formed Sudoku puzzle.

#### Generalized Sudoku

Generalized Sudoku is played on a board made up by an `n`-by-`n` grid of boxes, each box made up by an `n`-by-`n` grid of tiles, where `n` is the base of the Sudoku board. There are `n^2` distinct values in the game, which can be any set of distinct symbols, but for the case of this website with be the numbers 1-9 and letters of the Latin alphabet as needed. Similar to 3-Sudoku, each row, box, and column must have each of the `n`-by-`n` distinct values, and each of these values must appear only once in each row, box, and column. The goal is to discover the value of each tile on the board.

### Website controls and options

The user can navigate around the board by using the arrow keys or the mouse to click on the desired tile to travel to. The selected tile is highlighted red. When the user makes a guess, the guess will be entered to this selected tile. Some tiles will be revealed to the player at the beginning of the puzzle to help them solve it. These tiles have a dark gray rather than light gray background, and cannot be changed by the user. If a guess is not entered in an unrevealed tile, the user can enter in possible values, termed "candidates," based on what they currently know. These will appear in a small, light-colored font in the tile they describe. To enter these candidates, press the `Shift` key while pressing the key of the desired candidate. To remove a candidate from a tile, press the `Shift` key while pressing the key of the desired candidate.

A timer is kept by default. To pause this timer, press the `Pause` button in the side menu. The board will disappear until `Play` is pressed. Below this is the selector for Sudoku `n` value. By default, this is set to 3 for 3-Sudoku, but can be changed by the user to any value between 2 and 5 inclusive. Beneat this slider is the `Generate new board` button, which uses the selected `n` value to generate a new board at random (technical details on the board generation process are given in the "Technical details" section). Below this is the `Hint` button, which will reveal a random unrevealed tile to the user. It will not override any of the user's guesses.

Below this are two optional modes for playing. The first is candidate mode, which changes the default entry option. By default, entering a key on a tile will enter a guess on that tile and entering a key with `Shift` entered beforehand will enter a candidate. With candidate mode on, this will switch to entereing candidates by default and guesses only when `Shift` is pressed. Error check mode will highlight all incorrect guesses entered in red. Error check mode does not check candidates, only full guesses.

When a user wins, the timer will stop and the text "Congratulations! :)" will appear below the error check mode switch. If all tiles have been entered but the timer does not stop and this text does not appear, a mistake has been made.

## Technical implementation

### Original board generation

Board generation source code can be found in the `generation` directory. Java was used for this part of the code. To generate a Sudoku board, the code first creates a 2 dimensional array of `n^2` by `n^2` dimensions, filled with `null` values. The generator goes through each tile and selects a value at random out of all possible values for this tile given external information. If a tile is found to have no possible values or if each possible value leads only to board configurations where some other tile has no possible values, the algorithm backtracks to the previous tile and selects a different choice from the rest of its possible values. If there are none, it backtracks again. It continues this process until the board has been completely filled in.

After the solution to the puzzle is generated, a mask is generated over the puzzle. This is a 2 dimensional array of boolean values aligned with the board array, where `true` marks that a value is masked (not revealed to the user), and `false` marks that a value is unmasked (revealed to the user). All possible tile positions are placed in a random order. The masked goes through each tile in this random order and checks if masking it will produce a puzzle with more than one possible solution. To do this, it runs a Sudoku solver that checks all possible values in all possible tiles. If it reaches two possible solutions, it stops calculating. If it is found that masking this tile would produce a puzzle with more than one solution, the tile remains unmasked. Otherwise, it is masked. This means that masking any unmasked tile would give the puzzle a non-unique solution.

### Board scrambling algorithm

For the higher `n`-values, particularly for 5-Sudoku, generating a new board on the spot would be very slow, even if it were done in highly optimized low-level code. To account for this, board scrambling is used for board generation. This process takes a set of 25 randomly generated boards for a given base (generated using the original board generation algorithm), picks one at random, and performs a series of shuffling operations on the board. It is a property of Sudoku boards that any box column or box row can be changed with any other, and the board remains valid. Similarly, any row within a box row and any column within a box column can be changed with any other to produce a valid board. To generate a scrambled board, 500 random shuffling operations are done on a randomly selected board from the set of 25 originally generated, producing a unique puzzle. The solution board and mask are both scrambled in the same way, to ensure they stay aligned.

## Project information

This project was started by [Nicolas Antonio Cloutier](mailto:nicocloutier1@gmail.com) in 2024. There are no additional contributors as of yet. If you have suggestions, issues, or additions, feel free to open an issue or pull request on the [GitHub page](https://github.com/NicoACloutier/n-sudoku). This project operates under the MIT license. Licensing information can be found in the file entitled `LICENSE` in this project's top-level directory.