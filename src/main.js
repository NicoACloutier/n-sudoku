const id = "container";

// Construct a box within a Sudoku board based on boar statr.
function createBox(n, row, col, selected, defaultVal, val) {
    boxClass = selected ? "selectedbox" : (defaultVal ? "defaultbox" : "unselectedbox");
    innerVal = val === null ? "" : val;
    size = Math.floor(100 / (n*n));
    return `<div class="${boxClass}">${innerVal}</div>\n`;
}

// Create a grid given a Sudoku base, HTML id, current selection location, and default and entered values.
function createGrid(n, id, selectRow, selectCol, defaultVals, enteredVals) {
    gridContents = "";
    for (let i = 0; i < n*n; i++) {
        for (let j = 0; j < n*n; j++) {
            selected = selectRow === i && selectCol === j;
            defaultVal = defaultVals[i][j] !== null;
            val = defaultVal ? defaultVals[i][j] : enteredVals[i][j];
            gridContents += createBox(n, i, j, selected, defaultVal, val);
        }
    }
    document.getElementById(id).style.setProperty("grid-template-columns", `repeat(${n*n}, 1fr)`);
    document.getElementById(id).style.setProperty("grid-template-rows", `repeat(${n*n}, 1fr)`);
    document.getElementById(id).innerHTML = gridContents;
}

// Get possible values for a Sudoku board given its base.
function getPossible(n) {
    return "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0".slice(0, n*n);
}

// THE FOLLOWING ARE TEST VALUES, AND WILL SOON BE REMOVED
n = 2;
possible = getPossible(n)
row = 0;
col = 0;
defaultVals = [[1, 2, 3, 4], [null, null, null, null], [null, null, null, null], [null, null, null, null]];
enteredVals = [[null, null, null, null], [2, null, null, null], [null, null, null, null], [null, null, null, null]];
// END OF TEST VALUES

createGrid(n, id, row, col, defaultVals, enteredVals);
window.addEventListener("keydown", (event) => {
    // Control arrow key logic
    if (event.key === "ArrowDown") row = row === (n*n) - 1 ? row : row + 1;
    else if (event.key === "ArrowUp") row = row === 0 ? row : row - 1;
    else if (event.key === "ArrowRight") col = col === (n*n) - 1 ? col : col + 1;
    else if (event.key === "ArrowLeft") col = col === 0 ? col : col - 1;
    
    // Control guess entry logic
    else if (possible.includes(event.key)) enteredVals[row][col] = event.key;
    else if (event.key === "Backspace") enteredVals[row][col] = "";
    
    // Create grid
    createGrid(n, id, row, col, defaultVals, enteredVals);
});