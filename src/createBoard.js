import * as Base from './board.js';

const NUM_SHUFFLES = 500;

// Get possible values for a Sudoku board given its base.
function getPossible(n) {
    return "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0".slice(0, n*n);
}

function pickOriginal(jsonList) {
    return jsonList[Math.floor(Math.random() * jsonList.length)];
}

function switchValues(ind1, ind2, array) {
    let temp = array[ind1];
    array[ind1] = array[ind2];
    array[ind2] = temp;
    return array;
}

function shuffle_row(row1, row2, arr, nsqr) {
    let initial1 = row1 * nsqr;
    let initial2 = row2 * nsqr;
    for (let i = 0; i < nsqr; i++) {
        arr = switchValues(initial1 + i, initial2 + i, arr);
    }
    return arr;
}

function shuffle_col(col1, col2, arr, nsqr) {
    for (let i = 0; i + col1 < arr.length && i + col2 < arr.length; i += nsqr) {
        arr = switchValues(col1 + i, col2 + i, arr);
    }
    return arr;
}

function shuffle_bigrow(row1, row2, board, n) {
    let initial1 = row1 * n;
    let initial2 = row2 * n;
    for (let i = 0; i < n; i++) {
        board.board = shuffle_row(initial1, initial2, board.board, n*n);
        board.mask = shuffle_row(initial1, initial2, board.mask, n*n);
    }
    return board;
}

function shuffle_bigcol(col1, col2, board, n) {
    let initial1 = col1 * n;
    let initial2 = col2 * n;
    for (let i = 0; i < n; i++) {
        board.board = shuffle_col(initial1, initial2, board.board, n*n);
        board.mask = shuffle_col(initial1, initial2, board.mask, n*n);
    }
    return board;
}

function randomShuffle(board, n, nsqr) {
    let big = Math.random() > 0.5;
    let row = Math.random() > 0.5;
    if (big) {
        let ind1 = Math.floor(Math.random() * n);
        let ind2 = Math.floor(Math.random() * n);
        while (ind1 == ind2) {
            ind2 = Math.floor(Math.random() * n);
        }
        return row ? shuffle_bigrow(ind1, ind2, board, n) : shuffle_bigcol(ind1, ind2, board, n);
    }
    else {
        let bigOne = Math.floor(Math.random() * n) * n;
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

function shuffle(board, n) {
    let nsqr = n*n;
    for (let i = 0; i < NUM_SHUFFLES; i++) {
        board = randomShuffle(board, n, nsqr);
    }
    return board;
}

function replaceValue(board, initialVal, replacementVal) {
    (board.board).forEach((value, index) => {
        if (value === initialVal) board.board[index] = replacementVal;
    });
}

function makeDefaults(board) {
    return (board.board).map((value, index) => { return board.mask[index] === "true" ? null : value; } );
}

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
        ``
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
    return board;
}