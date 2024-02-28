import { generateBoard } from './createBoard.js';

const id = "container";

let n = 3;
let nsqr = n*n;
let board = generateBoard(n);
let possible = board.possible;
let row = 0;
let col = 0;
let defaultVals = board.defaultVals;
let enteredVals = board.enteredVals;

// Get possible values for a Sudoku board given its base.
function getPossible(n) {
    return "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0".slice(0, n*n);
}

// Construct a box within a Sudoku board based on board state.
function createBox(n, selected, defaultVal, val) {
    let boxClass = selected ? "selectedbox" : (defaultVal ? "defaultbox" : "unselectedbox");
    let innerVal = val === null ? "" : val;
    let size = Math.floor(100 / (n*n));
    let padVal = 50 / (n*2);
    return `<div class="${boxClass}" style="padding: ${padVal}%;">${innerVal}</div>\n`;
}

// Create a grid given a Sudoku base, HTML id, current selection location, and default and entered values.
function createGrid(n, id, selectRow, selectCol, defaultVals, enteredVals) {
    nsqr = n*n;
    let gridContents = "";
    for (let i = 0; i < defaultVals.length; i += 1) {
        let selected = selectRow * nsqr + selectCol === i;
        let defaultVal = defaultVals[i] !== null;
        let val = defaultVal ? defaultVals[i] : enteredVals[i];
        gridContents += createBox(n, selected, defaultVal, val);
    }
    document.getElementById(id).style.setProperty("grid-template-columns", `repeat(${n*n}, 1fr)`);
    document.getElementById(id).style.setProperty("grid-template-rows", `repeat(${n*n}, 1fr)`);
    document.getElementById(id).innerHTML = gridContents;
}

createGrid(n, id, row, col, defaultVals, enteredVals);
window.addEventListener("keydown", (event) => {
    // Control arrow key logic
    if (event.key === "ArrowDown") row = row === nsqr - 1 ? row : row + 1;
    else if (event.key === "ArrowUp") row = row === 0 ? row : row - 1;
    else if (event.key === "ArrowRight") col = col === (nsqr) - 1 ? col : col + 1;
    else if (event.key === "ArrowLeft") col = col === 0 ? col : col - 1;
    
    // Control guess entry logic
    else if (possible.includes(event.key)) enteredVals[row * nsqr + col] = event.key;
    else if (event.key === "Backspace") enteredVals[row * nsqr + col] = "";
    
    // Create grid
    createGrid(n, id, row, col, defaultVals, enteredVals);
});