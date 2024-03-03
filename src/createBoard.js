/*
This file contains function that perform Sudoku board generation.
    Instead of generating the boards from scratch, it uses boards pre-generated in Java (see `../generation`)
    and performs random shuffles on them to make distinct boards.
    These shuffles consist of either shuffling around small columns/rows within the same big column/row,
    or shuffling around the big columns/rows themselves.
    
It exports one function, `generateBoard`, which takes as its only argument the base of the board, and will
generate a board to be used for the Sudoku game based on the contents of `./board.js`, which should contain
boards stored in a JSON format. Simply call this function to receive a random board.
*/

import * as Base from './board.js'; // import generated original boards

const NUM_SHUFFLES = 500; // number of random shuffling operations to perform on Sudoku board

/*
Get possible tile values for a Sudoku board given its base.
Arguments:
    `n`: The base of the Sudoku board. Should be an integer.
Returns:
    `possible`: A string containing all possible values as characters.
*/
function getPossible(n) {
    return "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0".slice(0, n*n);
}

/*
Pick an original base given a list of possible original boards for a base.
Arguments:
    `jsonList`: The list of original boards for a particular base.
Returns:
    `original`: An original board to perform shuffles on.
*/
function pickOriginal(jsonList) {
    return jsonList[Math.floor(Math.random() * jsonList.length)];
}

/*
Switch the values at two indeces in an array.
Arguments:
    `ind1`: The first index to perform the switch at. Should be an integer.
    `ind2`: The second index to perform the switch at. Should be an integer.
    `array`: The array to perform the switch on.
Returns:
    `array`: The array with switched values.
        NOTE: This performs the switch in-place, but it returns the array anyway.
*/
function switchValues(ind1, ind2, array) {
    let temp = array[ind1];
    array[ind1] = array[ind2];
    array[ind2] = temp;
    return array;
}

/*
Shuffle a row within a Sudoku board array.
Arguments:
    `row1`: The number of the first row to switch. Should be integer between 0 and `nsqr-1`.
    `row2`: The number of the second row to switch. Should be integer between 0 and `nsqr-1`.
    `arr`: The array to perform the switch on.
    `nsqr`: The base of the Sudoku board squared.
Returns:
    `arr`: The array with the rows switched.
        NOTE: This performs the switch in-place, but it returns the array anyway.
*/
function shuffle_row(row1, row2, arr, nsqr) {
    let initial1 = row1 * nsqr;
    let initial2 = row2 * nsqr;
    for (let i = 0; i < nsqr; i++) {
        arr = switchValues(initial1 + i, initial2 + i, arr);
    }
    return arr;
}

/*
Shuffle a column within a Sudoku board array.
Arguments:
    `col1`: The number of the first column to switch. Should be integer between 0 and `nsqr-1`.
    `col2`: The number of the second column to switch. Should be integer between 0 and `nsqr-1`.
    `arr`: The array to perform the switch on.
    `nsqr`: The base of the Sudoku board squared.
Returns:
    `arr`: The array with the rows switched.
        NOTE: This performs the switch in-place, but it returns the array anyway.
*/
function shuffle_col(col1, col2, arr, nsqr) {
    for (let i = 0; i + col1 < arr.length && i + col2 < arr.length; i += nsqr) {
        arr = switchValues(col1 + i, col2 + i, arr);
    }
    return arr;
}

/*
Shuffle a 'big row' (i.e. a row of boxes rather than tiles) in a Sudoku board.
Arguments:
    `row1`: The number of the first row to switch. Should be integer between 0 and `n-1`.
    `row2`: The number of the second row to switch. Should be integer between 0 and `n-1`.
    `board`: The board to perform the switch on.
    `n`: The base of the Sudoku board.
Returns:
    `board`: The board with the big rows switched.
        NOTE: This performs the switch in-place, but it returns the board anyway.
*/
function shuffle_bigrow(row1, row2, board, n) {
    let initial1 = row1 * n;
    let initial2 = row2 * n;
    for (let i = 0; i < n; i++) {
        board.board = shuffle_row(initial1 + i, initial2 + i, board.board, n*n);
        board.mask = shuffle_row(initial1 + i, initial2 + i, board.mask, n*n);
    }
    return board;
}

/*
Shuffle a 'big column' (i.e. a column of boxes rather than tiles) in a Sudoku board.
Arguments:
    `col1`: The number of the first column to switch. Should be integer between 0 and `n-1`.
    `col2`: The number of the second column to switch. Should be integer between 0 and `n-1`.
    `board`: The board to perform the switch on.
    `n`: The base of the Sudoku board.
Returns:
    `board`: The board with the big columns switched.
        NOTE: This performs the switch in-place, but it returns the board anyway.
*/
function shuffle_bigcol(col1, col2, board, n) {
    let initial1 = col1 * n;
    let initial2 = col2 * n;
    for (let i = 0; i < n; i++) {
        board.board = shuffle_col(initial1 + i, initial2 + i, board.board, n*n);
        board.mask = shuffle_col(initial1 + i, initial2 + i, board.mask, n*n);
    }
    return board;
}

/*
Perform a random shuffle operation on a board.
    It chooses one of the following operations randomly:
        1. Switch two small rows within the same big row (e.g. rows 0 & 1 in a base-3 board)
        2. Switch two small columns within the same big columns (e.g. columns 4 & 5 in a base-3 board)
        3. Switch two big rows (e.g. big rows 1 & 2 in a base-3 board)
        4. Switch two big columns (e.g. big columns 3 & 4 in a base-3 board)
    The exact numbers on which rows/columns to switch are also chosen randomly from the possible values.
Arguments:
    `board`: The board to perform the shuffle on.
    `n`: The base of the board.
    `nsqr`: The base of the board, squared.
Returns:
    `board`: The board after a random shuffle operation.
        NOTE: This performs the shuffle in-place, but it returns the board anyway.
*/
function randomShuffle(board, n, nsqr) {
    let big = Math.random() > 0.5; // whether to shuffle a big row/column or not
    let row = Math.random() > 0.5; // whether to shuffle a row or column
    if (big) { // logic for big row/column shuffling
        // decide on indeces
        let ind1 = Math.floor(Math.random() * n);
        let ind2 = Math.floor(Math.random() * n);
        while (ind1 == ind2) {
            ind2 = Math.floor(Math.random() * n);
        }
        
        // perform shuffle
        return row ? shuffle_bigrow(ind1, ind2, board, n) : shuffle_bigcol(ind1, ind2, board, n);
    }
    else { // logic for small row/column shuffling
        let bigOne = Math.floor(Math.random() * n) * n; // the big row/column to shuffle on
        
        // decide on indeces
        let ind1 = null;
        let ind2 = null;
        if (n == 2) {
            ind1 = bigOne + 0;
            ind2 = bigOne + 1;
        }
        else {
            ind1 = bigOne + Math.floor(Math.random() * n);
            ind2 = bigOne + Math.floor(Math.random() * n);
            while (ind1 == ind2) {
                ind2 = bigOne + Math.floor(Math.random() * n);
            }
        }
        
        // perform shuffle
        if (row) {
            board.mask = shuffle_row(ind1, ind2, board.mask, nsqr);
            board.board = shuffle_row(ind1, ind2, board.board, nsqr);
        }
        else {
            board.board = shuffle_col(ind1, ind2, board.board, nsqr);
            board.mask = shuffle_col(ind1, ind2, board.mask, nsqr);
        }
        return board;
    }
}

/*
Fully shuffle a board.
Arguments:
    `board`: The board to perform the shuffle on.
    `n`: The base of the board.
Returns:
    `board`: The board post-shuffle.
        NOTE: This performs the shuffle in-place, but it returns the board anyway.
*/
function shuffle(board, n) {
    let nsqr = n*n;
    for (let i = 0; i < NUM_SHUFFLES; i++) {
        board = randomShuffle(board, n, nsqr);
    }
    return board;
}

/*
Replace a value within a board.
Arguments:
    `board`: The board to perform the replacement on.
    `initialVal`: The value to replace.
    `replacementVal`: The value to replace it with.
Returns:
    `board`: The board post-replacement.
        NOTE: This performs the replacement in-place, but it returns the board anyway.
*/
function replaceValue(board, initialVal, replacementVal) {
    (board.board).forEach((value, index) => {
        if (value === initialVal) board.board[index] = replacementVal;
    });
    return board;
}

/*
Construct default entries for a board given board information.
Arguments:
    `board`: The board to construct default entries on.
Returns:
    `defaultVals`: A 1D array with constructed default values to board displaying.
*/
function makeDefaults(board) {
    return (board.board).map((value, index) => { return board.mask[index] === "true" ? null : value; } );
}

/*
Construct entered values for a board.
Arguments:
    `board`: The board to construct entered values on.
Returns:
    `enteredVals`: A 1D array of `null`s aligned with `board.board`.
*/
function makeEntered(board) {
    return (board.board).map((value) => { return null; } );
}

/*
Generate a board using an existing original board given a base.
Arguments:
    `base`: An integer containing the base of the Sudoku board.
Returns:
    `board`: A Sudoku board object, with the following fields:
        `n`: The supplied integer base of the Sudoku board.
        `possible`: An array of characters containing possible values within the board.
        `defaultVals`: A 1D array with the default values stored in the Sudoku board.
        `enteredVals`: A 1D array that should be entirely `null` with entered values.
        `mask`: A 1D array containing information on which tiles are masked.
*/
export function generateBoard(base) {
    let jsonList = [];
    switch (base) {
        case 2: jsonList = Base.base_2; break;
        case 3: jsonList = Base.base_3; break;
        case 4: jsonList = Base.base_4; break;
        case 5: jsonList = Base.base_5; break;
    }
    let original = pickOriginal(jsonList);
    var board = JSON.parse(original).board;
    board = shuffle(board, base);
    board.possible = getPossible(board.n).split("");
    board.defaultVals = makeDefaults(board);
    board.enteredVals = makeEntered(board);
    board.mask = (board.mask).map((value) => { return value === "true"; });
    return board;
}