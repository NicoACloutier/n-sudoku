/*
Get sizing information for a tile.
Arguments:
    `n`: The base of the Sudoku board.
    `candidate`: Whether the tile is in candidate mode.
Returns:
    `sizeStyle`: CSS styling for tile size determination.
*/
function getSize(n, candidate) {
    let padVal = 0;
    let fontSize = 0;
    if (candidate) {
        switch (n) { // these are the values in candidate mode
            case 2: padVal = 0; fontSize = 400; break;
            case 3: padVal = 1; fontSize = 160; break;
            case 4: padVal = 0; fontSize = 60; break; 
            case 5: padVal = 3; fontSize = 40; break; 
        }
    }
    else { // these are the values otherwise
        switch (n) {
            case 2: padVal = 20; fontSize = 360; break; // set padding and font size for base-2 boards (%)
            case 3: padVal = 15; fontSize = 200; break; // set padding and font size for base-3 boards (%)
            case 4: padVal = 5; fontSize = 140; break; // set padding and font size for base-4 boards (%)
            case 5: padVal = 0; fontSize = 100; break; // set padding and font size for base-5 boards (%)
        }   
    }
    return `padding: ${padVal}%; font-size: ${fontSize}%;`;
}

/*
Create style information for a tile.
Arguments:
    `n`: The base of the Sudoku board.
    `i`: The index of the tile.
    `candidate`: Whether or not the tile is in candidate mode.
Returns:
    `style`: A string with CSS styling information for the tile.
*/
function createStyle(n, i, candidate) {
    let style = getSize(n, candidate);
    
    const nsqr = n*n;
    const isTop = (Math.floor(i / nsqr) % n === 0);
    const isLeft = ((i % nsqr) % n === 0);
    const isRight = (((i+1) % nsqr) % n === 0);
    const isBottom = (Math.floor((i+nsqr) / nsqr) % n === 0);
    
    if (isTop) {
        const isExtremeTop = Math.floor(i / nsqr) === 0;
        if (isExtremeTop) style += " border-top: 4px solid black;";
        else style += " border-top: 2px solid black;";
    }
    if (isLeft) {
        const isExtremeLeft = (i % nsqr) === 0;
        if (isExtremeLeft) style += " border-left: 4px solid black;";
        else style += " border-left: 2px solid black;";
    }
    if (isRight) {
        const isExtremeRight = ((i+1) % nsqr) === 0;
        if (isExtremeRight) style += " border-right: 4px solid black;";
        else style += " border-right: 2px solid black;";
    }
    if (isBottom) {
        const isExtremeBottom = i >= nsqr * (nsqr-1);
        if (isExtremeBottom) style += " border-bottom: 4px solid black;";
        else style += " border-bottom: 2px solid black;";
    }
    
    if (candidate) { style += " color: #333333;" }
    
    return style;
}

/*
Construct the inner HTML to display given candidates within a tile.
Arguments:
    `candidates`: The candidates for this tile.
    `n`: The base of the Sudoku board.
Returns:
    `candidateGrid`: The inner grid or string with candidate displaying information.
*/
function displayCandidates(candidates, n) {
    let columns = "";
    let rows = "";
    switch (n) {
        case 2: columns = "1fr 1fr"; rows = "1fr 1fr"; break;
        case 3: columns = "1fr 1fr 1fr"; rows = "1fr 1fr 1fr"; break;
        case 4: columns = "1fr 1fr 1fr 1fr"; rows = "1fr 1fr 1fr 1fr"; break;
        case 5: columns = "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr"; rows = "1fr 1fr 1fr"; break;
    }
    // let columns = (n === 5) ? " 1fr".repeat(Math.ceil(n*n/3)).substring(1) : " 1fr".repeat(n).substring(1);
    // let rows = (n === 5) ? " 1fr".repeat(3).substring(1) : " 1fr".repeat(n).substring(1);
    let style = `grid-template-columns: ${columns}; grid-template-rows: ${rows}; font-weight: normal;`;
    if (n !== 2) { style += " font-family: monospace;" }
    let candidateGrid = `<div class="candidate-grid" style="${style}">`;
    for (let i = 0; i < candidates.length; i++) {
        candidateGrid += `<div class="grid-item">${candidates.charAt(i)}</div>`;
    }
    return candidateGrid + "</div>";
}

/*
Construct the inner HTML to display given candidates within a tile with memoization.
Arguments:
    `candidates`: The candidates for this tile.
    `n`: The base of the Sudoku board.
    `memo`: The current saved memoized state.
Returns:
    `candidateGrid`: The inner grid or string with candidate displaying information.
*/
function memoizedDisplayCandidates(candidates, n, memo) {
    let representation = `${candidates} ${n}`
    if (memo[representation]) return memo[representation];
    else {
        let style = displayCandidates(candidates, n);
        memo[representation] = style;
        return style;
    }
}

/*
Construct a tile within a Sudoku board based on board state.
Arguments:
    `n`: The base of the Sudoku board.
    `selected`: Whether the given tile has been selected.
    `defaultVal`: Whether the box has a given value.
    `candidates`: The candidate string for this box.
        NOTE: This should be laid out with spaces where no candidate is entered, and the candidate otherwise.
    `val`: The entered value for this tile.
        NOTE: Empty if this is `""` or `null`.
    `i`: The index of the tile
    `memo`: Object used for memoization of candidate displaying.
    `errorMode`: Boolean, `true` when error check mode enabled and `false` otherwise.
    `correct`: The correct value for this tile.
        NOTE: Should only be used when `errorMode === true`
Returns:
    `innerHTML`: The inner HTML for the tile div inside of the container grid.
*/
export function createTile(n, selected, defaultVal, candidates, val, i, memo, errorMode, correct) {
    let boxClass = selected ? "selectedbox" : (defaultVal ? "defaultbox" : "unselectedbox");
    let candidate = (val === null || val === "") && boxClass !== "defaultbox";
    
    let innerVal = "";
    if (candidate && n > 3) innerVal = memoizedDisplayCandidates(candidates, n, memo);
    else if (candidate) innerVal = displayCandidates(candidates, n);
    else innerVal = val === null ? "" : val;
    
    let style = createStyle(n, i, candidate);
    if (errorMode && !defaultVal && !candidate && correct !== val) { style += " color: #8b0000;"; }
    
    return `<div class="${boxClass}" style="${style} line-break: anywhere;">${innerVal}</div>\n`;
}