import * as Base from './board.js';

const NUM_SHUFFLES = 50;

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
    array[ind1] = temp;
}

function shuffle_row(row1, row2, board, nsqr) {
    let initial1 = row1 * nsqr;
    let initial2 = row2 * nsqr;
    for (let i = 0; i < nsqr; i++) {
        switchValues(initial1 + i, initial2 + i, board.board);
        switchValues(initial1 + i, initial2 + i, board.mask);
    }
    return board;
}

function shuffle_col(col1, col2, board, nsqr) {
    for (let i = 0; i < nsqr; i += nsqr) {
        switchValues(col1 + i, col2 + i, board.board);
        switchValues(col1 + i, col2 + i, board.mask);
    }
    return board;
}

function shuffle_bigrow(row1, row2, board, n) {
    let initial1 = row1 * n;
    let initial2 = row2 * n;
    for (let i = 0; i < n; i++) {
        board = shuffle_row(initial1, initial2, board, n*n);
    }
    return board;
}

function shuffle_bigcol(col1, col2, board, n) {
    let initial1 = col1 * n;
    let initial2 = col2 * n;
    for (let i = 0; i < n; i++) {
        board = shuffle_col(initial1, initial2, board, n*n);
    }
    return board;
}

function random_shuffle(board, n, nsqr) {
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
        let ind1 = Math.floor(Math.random() * nsqr);
        let ind2 = Math.floor(Math.random() * nsqr);
        while (ind1 == ind2) {
            ind2 = Math.floor(Math.random() * nsqr);
        }
        return row ? shuffle_row(ind1, ind2, board, nsqr) : shuffle_col(ind1, ind2, board, nsqr);
    }
}

function shuffle(board, n) {
    let nsqr = n*n;
    for (let i = 0; i < NUM_SHUFFLES; i++) {
        board = random_shuffle(board, n, nsqr);
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

export function generateBoard(base) {
    let jsonList = [];
    switch (base) {
        case 2: jsonList = Base.base_2; break;
        case 3: jsonList = Base.base_3; break;
        case 4: jsonList = Base.base_4; break;
        case 5: jsonList = Base.base_5; break;
    }
    let original = pickOriginal(jsonList);
    let board = JSON.parse(original);
    board = board.board;
    board = shuffle(board, base);
    board.possible = getPossible(board.n).split("");
    board.defaultVals = makeDefaults(board);
    console.log(board.board);
    board.enteredVals = makeEntered(board);
    return board;
}