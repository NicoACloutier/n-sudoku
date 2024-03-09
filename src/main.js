import { generateBoard } from './createBoard.js';
import { createTile } from './tiles.js';

let time = 0;
let interval = window.setInterval(setTime, 1000); // Increment time once per 1000 milliseconds (1 second)
let paused = false, won = false, candidateMode = false, errorMode = false; // Whether it's paused, whether it's been won, whether candidate mode is on, whether error mode is on
let styleMemo = {};
let clickListener = null;

const id = "container"; // Primary ID of main board container

/*
Get possible values for a Sudoku board given its base.
Arguments:
    `n`: Base of the Sudoku board.
Returns:
    `possible`: String of possible characters in the Sudoku board.
*/
function getPossible(n) {
    return "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0".slice(0, n*n);
}
   
/*
Create a grid given a Sudoku base, HTML id, current selection location, and default and entered values.
Arguments:
    `n`: Base of the Sudoku board.
    `id`: Primary ID of main board container.
    `ind`: Current index within board tiles.
    `defaultVals`: Default (given) values for puzzle.
    `enteredVals`: Array of values entered by user.
    `candidates`: Array of candidate strings entered by user for puzzle.
    `memo`: Object used for memoization of tile style state.
    `board`: Object with internal board information.
Returns:
    `void`
*/
function createGrid(n, id, ind, defaultVals, enteredVals, candidates, memo, board) {
    const nsqr = n*n;
    let gridContents = "";
    for (let i = 0; i < defaultVals.length; i += 1) {
        let selected = ind === i;
        let defaultVal = defaultVals[i] !== null;
        let val = defaultVal ? defaultVals[i] : enteredVals[i];
        gridContents += createTile(n, selected, defaultVal, candidates[i], val, i, memo, errorMode, board[i]);
    }
    document.getElementById(id).innerHTML = gridContents;
}

/*
Whether a particular set of entered values is a correct solution to a given board.
Arguments:
    `enteredVals`: Array of values entered by user.
    `board`: Object with internal board information.
Returns:
    `isCorrect`: Whether the set of values entered is the solution to the board.
*/
function isCorrect(enteredVals, board) {
    for (let i = 0; i < enteredVals.length; i++) {
        if (board.mask[i]) {
            if (enteredVals[i] !== board.board[i]) { return false; }
        }
    }
    return true;
}

/*
Replace a string at a particular index.
Arguments:
    `this`: The string to replace on.
    `index`: Integer with index to replace at.
    `replacement`: Replacement string.
Returns:
    `replaced`: String with replaced substring.
*/
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

/*
Convert a numeric value less than 100 to a string with leading zeros.
Arguments:
    `val`: The numeric value to convert.
Returns:
    `strVal`: String value less than 100, possibly with leading 0.
*/
function addZero(val) {
    if (val % 10 === val) { return `0${val}`; }
    return `${val}`
}

/*
Increment time, save to local storage, and display timer.
    NOTE: `time` is a global variable. This modifies global state.
Arguments:
    `void`
Returns:
    `void`
*/
function setTime() {
    time += 1;
    localStorage.setItem("time", JSON.stringify(time));
    let seconds = Math.floor(time % 60);
    let minutes = Math.floor((time % 3600) / 60);
    let hours = Math.floor(time / 3600);
    document.getElementById("timer").innerHTML = `${hours}:${addZero(minutes)}:${addZero(seconds)}`;
}

/*
Check whether an unwon board has been won and display entered key.
Arguments:
    `won`: The current boolean value, whether the board has been solved.
    `possible`: String of possible values for tiles.
    `code`: Entered keycode by user. `null` if n/a.
    `enteredVals`: Array of values entered by user.
    `shift`: Whether the key entered by user was entered with a shift. `null` if n/a.
    `candidates`: Array of entered candidates by user.
    `board`: Object containing internal board information.
    `interval`: Time interval user for timer.
    `winVal`: HTML tag where win state is displayed.
    `key`: Key entered by user.
    `ind`: Current index user is located at within board.
Returns:
    `void`
*/
function checkWin(won, possible, code, enteredVals, shift, candidates, board, interval, winVal, key, ind) {
    if (!won) {
        // Control guess entry logic
        let index = possible.indexOf(code)
        if (index !== -1 && !shift) enteredVals[ind] = code;
        else if (index !== -1) { // Control candidate entry
            if (candidates[ind].includes(code)) candidates[ind] = candidates[ind].replaceAt(index, " ");
            else { candidates[ind] = candidates[ind].replaceAt(index, code); }
        }
        else if (key === "Backspace") enteredVals[ind] = "";
        localStorage.setItem("enteredVals", JSON.stringify(enteredVals));
        localStorage.setItem("candidates", JSON.stringify(candidates));
        
        won = isCorrect(enteredVals, board);
        if (won) {
            window.clearInterval(interval); // Stop timer
            winVal.innerHTML = "Congrats! :)";
        }
    }
}

/*
Draw a board to screen given internal board information.
Arguments:
    `board`: Object with internal board information.
    `enteredVals`: Array with guesses entered by user.
    `n`: Base of board.
    `candidates`: Array with candidates entered by user.
Returns:
    `void`
*/
function drawBoard(board, enteredVals, n, candidates) {
    won = false;
    const nsqr = n*n;
    let possible = board.possible;
    let ind = 0;
    const defaultVals = board.defaultVals;
    let winVal = document.getElementById("winstate");
    winVal.innerHTML = "";
    document.getElementById(id).outerHTML = document.getElementById(id).outerHTML; // Remove old event listeners
    
    document.getElementById(id).style.setProperty("grid-template-columns", `repeat(${nsqr}, 1fr)`);
    document.getElementById(id).style.setProperty("grid-template-rows", `repeat(${nsqr}, 1fr)`);
    
    document.getElementById(id).addEventListener("click", (event) => {
        if (event.target.className.endsWith("box")) ind = [...event.target.parentElement.children].indexOf(event.target); // Mouse support
        createGrid(n, id, ind, defaultVals, enteredVals, candidates, styleMemo, board.board);
    });
    
    errorMode = JSON.parse(localStorage.getItem("errorMode"));
    let errorSwitch = document.getElementById("error");
    errorSwitch.onclick = function() {
        errorMode = !errorMode;
        localStorage.setItem("errorMode", JSON.stringify(errorMode));
        createGrid(n, id, ind, defaultVals, enteredVals, candidates, styleMemo, board.board);
    }
    
    let hintButton = document.getElementById("hint");
    hintButton.onclick = function () {
        let length = board.board.length;
        let index = Math.floor(Math.random() * length);
        for (let i = 0; i < length; i++) {
            let val = enteredVals[i+index];
            if (board.defaultVals[i+index] === null && (val === "" || val === null)) {
                board.defaultVals[i+index] = board.board[i+index];
                break;
            }
            if (index+i === length-1) index = 0;
        }
        createGrid(n, id, index, defaultVals, enteredVals, candidates, styleMemo, board.board);
    }

    checkWin(won, possible, null, enteredVals, null, candidates, board, interval, winVal, null, ind);
    createGrid(n, id, ind, defaultVals, enteredVals, candidates, styleMemo, board.board);
    window.addEventListener("keydown", (event) => {
        // Control arrow key logic
        let placeShift = false;
        if (event.key === "ArrowDown") { ind = ind + nsqr > enteredVals.length ? ind : ind + nsqr; placeShift = true; }
        else if (event.key === "ArrowUp") { ind = ind - nsqr < 0 ? ind : ind - nsqr; placeShift = true; }
        else if (event.key === "ArrowRight") { ind = (ind+1) % nsqr === 0 ? ind : ind + 1; placeShift = true; }
        else if (event.key === "ArrowLeft") { ind = ind % nsqr === 0 ? ind : ind - 1; placeShift = true; }
        
        if (!placeShift) { // Check for win state. Only executed if the key was not a place shift (i.e. key was arrow key).
            won = isCorrect(enteredVals, board);
            let code = event.code.startsWith("Digit") || event.code.startsWith("Key") ? event.code.slice(event.code.length-1) : "";
            let shift = event.shiftKey ^ candidateMode;
            checkWin(won, possible, code, enteredVals, shift, candidates, board, interval, winVal, event.key, ind);
        }
        
        createGrid(n, id, ind, defaultVals, enteredVals, candidates, styleMemo, board.board);
    });
}

/*
Create a new board at random given a base and write to screen.
Arguments:
    `n`: The base of the board to be created.
Returns:
    `void`
*/
function makeBoard(n) {
    time = 0;
    won = false;
    let board = generateBoard(n);
    localStorage.setItem("board", JSON.stringify(board));
    localStorage.setItem("enteredVals", JSON.stringify(board.enteredVals));
    localStorage.setItem("candidates", JSON.stringify(board.candidates));
    drawBoard(board, board.enteredVals, n, board.candidates);
}

/*
Find a board in local storage if applicable, and create new one if not.
Arguments:
    `n`: The base of the Sudoku board.
Returns:
    `void`
*/
function findDrawBoard(n) {
    let slider = document.getElementById("sideslider");
    let board = JSON.parse(localStorage.getItem("board"));
    if (board === null) { makeBoard(n); }
    else {
        n = board.n;
        slider.value = n;
        time = JSON.parse(localStorage.getItem("time"));
        setTime(); // Display the time
        let enteredVals = JSON.parse(localStorage.getItem("enteredVals"));
        let candidates = JSON.parse(localStorage.getItem("candidates"));
        drawBoard(board, enteredVals, n, candidates);
    }
}

function main() {
    let n = JSON.parse(localStorage.getItem("n")); // Retrieve base value from local storage
    if (n === null) n = 3;
    
    // Base selecting slider logic
    let slider = document.getElementById("sideslider");
    let sliderVal = document.getElementById("basenumber");
    sliderVal.innerHTML = "n";
    slider.oninput = function() {
        sliderVal.innerHTML = this.value;
        n = parseInt(this.value);
        localStorage.setItem("n", JSON.stringify(n));
    }
    
    // Board generation logic
    let generatorButton = document.getElementById("generator");
    generatorButton.onclick = function() {
        paused = false;
        
        // Reset timer
        time = 0;
        window.clearInterval(interval); // Stop old timer
        window.outerHTML = window.outerHTML;
        interval = window.setInterval(setTime, 1000); // Start new timer
        document.getElementById("timer").innerHTML = "0:00:00";
        
        // Make board
        makeBoard(n);
    }
    
    // Pause logic
    let pauseButton = document.getElementById("pause");
    pauseButton.onclick = function () {
        paused = !paused;
        if (paused) {
            if (!won) {
                window.clearInterval(interval);
                document.getElementById(id).innerHTML = "";
            }
            this.innerHTML = "Play";
        }
        else {
            if (!won) {
                interval = window.setInterval(setTime, 1000); // Start new timer
                setTime();
                findDrawBoard(n);
            }
            this.innerHTML = "Pause";
        }
    }
    
    // Candidate mode switch
    let candidateSwitch = document.getElementById("candidate");
    candidateSwitch.onclick = function() {
        candidateMode = !candidateMode;
        localStorage.setItem("candidateMode", JSON.stringify(candidateMode));
    }
    
    // Retrieve previous settings
    candidateMode = JSON.parse(localStorage.getItem("candidateMode"));
    errorMode = JSON.parse(localStorage.getItem("errorMode"));
    slider.value = n;
    candidateSwitch.checked = candidateMode;
    document.getElementById("error").checked = errorMode;
    
    findDrawBoard(n); // Find previous saved board if applicable, otherwise create new board. Write to screen.
}

main();