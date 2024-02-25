using Random
using Base.Threads

"The null character used to mark an absence or mask"
const NULL_CHAR::Char = '.'
"The number of threads to be utilized by the generation algorithm"
const NUM_THREADS::Int = 5
"A global variable containing information on which thread is finished."
finished::Int = 0

"""
A Sudoku board.
Fields:
    `n::Int`: The base of the Sudoku board (e.g. 3 for typical Sudoku)
    `board::Matrix{Char}`: The Sudoku board itself.
    `possible::Vector{Char}`: The possible characters in the board.
"""
struct Board
    n::Int
    board::Matrix{Char}
    possible::Vector{Char}
end

"""
A Sudoku board with a mask, ready to play with.
Fields:
    `board::Board`: The board itself.
    `mask::Matrix{Bool}`: The board mask, `true` for masked.
        NOTE: Should have the same dimensions as `board.board`.
"""
struct MaskedBoard
    board::Board
    mask::Matrix{Bool}
end

"""
Get the thread time limit for board generation.
Arguments:
    `n::Int`: The base of the Sudoku board.
Returns:
    `::Float64`: The time limit for board generation.
"""
function getlimit(n::Int)::Float64
    0.75 * n
end

"""
Whether a potential value has row collisions in a board.
Arguments:
    `board::Matrix{Char}`: The overall board.
    `val::Char`: The candidate value.
    `row::Int`: The candidate row.
Returns:
    `::Bool`: Whether there is a row collision.
"""
function has_rowcollision(board::Matrix{Char}, val::Char, row::Int)::Bool
    in(val, board[row, :])
end

"""
Whether a potential value has column collisions in a board.
Arguments:
    `board::Matrix{Char}`: The overall board.
    `val::Char`: The candidate value.
    `col::Int`: The candidate column.
Returns:
    `::Bool`: Whether there is a column collision.
"""
function has_colcollision(board::Matrix{Char}, val::Char, col::Int)::Bool
    in(val, board[:, col])
end

"""
Whether a potential value has box collisions in a board.
Arguments:
    `board::Matrix{Char}`: The overall board.
    `val::Char`: The candidate value.
    `row::Int`: The candidate row.
    `col::Int`: The candidate column.
    `n::Int`: The base of the Sudoku board.
Returns:
    `::Bool`: Whether there is a box collision.
"""
function has_boxcollision(board::Matrix{Char}, val::Char, row::Int, col::Int, n::Int)::Bool
    rowb::Int = floor((row - 1) / n) * n + 1 |> Int
    colb::Int = floor((col - 1) / n) * n + 1 |> Int
    in(val, board[rowb:rowb+n-1, colb:colb+n-1])
end

"""
Whether a potential board placement for a value is possible.
Arguments:
    `board::Matrix{Char}`: The board in question.
    `val::Char`: The candidate value.
    `row::Int`: The candidate row.
    `col::Int`: The candidate column.
    `n::Int`: The base of the Sudoku board.
Returns:
    `::Bool`: Whether the placement is possible.
"""
function ispossible(board::Matrix{Char}, val::Char, row::Int, col::Int, n::Int)::Bool
    !has_rowcollision(board, val, row) && !has_colcollision(board, val, col) &&
        !has_boxcollision(board, val, row, col, n)
end

"""
Get all possible characters for a particular base.
Arguments:
    `n::Int`: The base of the Sudoku board.
Returns:
    `::Vector{Char}`: The possible characters.
"""
function getpossiblechars(n::Int)::Vector{Char}
    ['0' + i for i in range(1, n*n)]
end

"""
Fill in a Sudoku board with valid values using a backtracking algorithm.
    NOTE: Call this with `row=1` and `col=1` to generate a full Sudoku board.
Arguments:
    `board::Matrix{Char}`: The current state of the board.
    `row::Int`: The current row to test value placement in.
    `col::Int`: The current column to test value placement in.
    `possible::Vector{Char}`: The possible values for box placement.
    `n::Int`: The base of the Sudoku board.
    `start::Float64`: The starting time for the running of the generation algorithm in seconds from epoch.
        NOTE: This is used by the time limit mechanism to allay unpredictable generation times.
    `limit::Float64`: The time limit for the generation algorithm.
        NOTE: This is used by the time limit mechanism to allay unpredictable generation times.
Returns:
    `::Union{Matrix{Char}, Int}`: If this is of type `::Matrix{Char}`, the algorithm completed successfully, and this is the result.
        If not, integer return values are associated with the following execution errors:
            `-2`: Another thread finished generation first.
            `-1`: Time limit exceeded.
            `0`: Incorrect value reached.
                NOTE: `0` should never be returned as a final output of a full generation call. It is used for internal purposes.
"""
function fillin(board::Matrix{Char}, row::Int, col::Int, possible::Vector{Char}, n::Int, start::Float64, limit::Float64)::Union{Matrix{Char}, Int}
    global finished
    if time() - start >= limit return -1
    elseif finished != 0 return -2
    elseif row == size(board, 1) && col == size(board, 2) + 1 return board
    elseif col > size(board, 2) return fillin(board, row+1, 1, possible, n, start, limit) end

    tile_possible = possible |> shuffle
    for candidate in tile_possible
        if !ispossible(board, candidate, row, col, n)
            if candidate == tile_possible[end]
                board[row, col] = NULL_CHAR
                return 0
            else continue end
        end
        board[row, col] = candidate
        res = fillin(board, row, col+1, possible, n, start, limit)
        if res == -1 return -1
        elseif res != 0 return board
        elseif candidate == tile_possible[end]
            board[row, col] = NULL_CHAR
            return 0
        else board[row, col] = NULL_CHAR end
    end
    -2
end

"""
Generate a full Sudoku board with no mask.
    NOTE: Intended to be run with multiple threads.
Arguments:
    `n::Int`: The base of the Sudoku board.
    `possible::Vector{Char}`: The possible values inside of the Sudoku board.
    `tid::Int`: The thread ID of the current thread.
    `lk::ReentrantLock`: A mutex to be placed on the global `finished` variable.
Returns:
    `::Matrix{Char}`: A 1x1 matrix with only the value '.' if another thread finished first.
        Otherwise, the completed Sudoku board.
"""
function generate(n::Int, possible::Vector{Char}, tid::Int, lk::ReentrantLock)::Matrix{Char}
    global finished
    limit = getlimit(n)
    result = -1
    while result in [-1, 0]
        board = fill(NULL_CHAR, (n*n, n*n))
        result = fillin(board, 1, 1, possible, n, time(), limit)
    end
    if isa(result, Int) || '.' in result
        return fill(NULL_CHAR, (1, 1))
    else
        lock(lk) do
            finished = tid
        end
        return result
    end
end

"""
Make a Sudoku board with no mask.
    NOTE: Spawns multiple threads.
Arguments:
    `n::Int`: The base of the Sudoku board.
Returns:
    `::Board`: The final Sudoku board.
"""
function make_unmasked(n::Int)::Board
    global finished
    possible = getpossiblechars(n)
    boards::Vector{Matrix{Char}} = [fill(NULL_CHAR, (1, 1)) for _ in range(1, NUM_THREADS)]
    lk = ReentrantLock()
    @Threads.threads for i in range(1, NUM_THREADS)
        boards[i] = generate(n, possible, i, lk)
    end
    board = boards[finished]
    lock(lk) do
        finished = 0
    end
    Board(n, board, possible)
end

"""
Apply a mask to a Sudoku board in-place.
Arguments:
    `maskedboard::Matrix{Char}`: The state of the board to be masked.
        NOTE: This is modified in-place by this function.
    `mask::Matrix{Bool}`: The mask to be used.
Returns:
    `::Nothing`
        NOTE: This modifies the supplied board in place. It does not have a return value.
"""
function applymask!(maskedboard::Matrix{Char}, mask::Matrix{Bool})::Nothing
    nsqr = size(maskedboard, 1)
    positions = [(row, col) for row in 1:nsqr, col in 1:nsqr]
    for position in positions
        if mask[position...]
            maskedboard[position...] = NULL_CHAR
        end
    end
    return nothing
end

"""
The number of solutions to a supplied masked Sudoku board.
    NOTE: Call this with `row=1` and `col=1` to find solutions for a full Sudoku board.
    NOTE: This stops counting after reaching 2.
Arguments:
    `board::Board`: The masked Sudoku board in question.
    `row::Int`: The current row to test valid placement in.
    `col::Int`: The current column to test valid placement in.
    `count::Int`: The current count of values.
    `mask::Matrix{Bool}`: The mask itself.
    `start::Float64`: The starting time for the running of the solution algorithm in seconds from epoch.
        NOTE: This is used by the time limit mechanism to allay unpredictable solution times.
    `limit::Float64`: The time limit for the solution algorithm.
        NOTE: This is used by the time limit mechanism to allay unpredictable solution times.
Returns:
    `::Int`: If positive or 0, the number of solutions to the given masked board.
        NOTE: -1 means the given time was exceeded.
"""
function solvecount(board::Board, row::Int, col::Int, count::Int, mask::Matrix{Bool}, start::Float64, limit::Float64)::Int
    nsqr = board.n*board.n
    if time() - start > limit return -1
    elseif row == nsqr + 1 applymask!(board.board, mask); return 1
    elseif col == nsqr + 1 count += solvecount(board, row+1, 1, count, mask, start, limit); return count
    elseif board.board[row, col] != NULL_CHAR count += solvecount(board, row, col+1, count, mask, start, limit); return count end
    for candidate in board.possible
        if count < 2 && ispossible(board.board, candidate, row, col, board.n)
            board.board[row, col] = candidate
            count += solvecount(board, row, col+1, count, mask, start, limit)
        elseif count >= 2 return count end
    end
    return count
end

"""
A high-level function to find the number of solutions to a masked Sudoku board.
    NOTE: This stops counting after reaching 2.
Arguments:
    `board::Board`: The unmasked board in question.
    `mask::Matrix{Bool}`: The mask to apply.
    `start::Float64`: The starting time for the running of the solution algorithm in seconds from epoch.
        NOTE: This is used by the time limit mechanism to allay unpredictable solution times.
    `limit::Float64`: The time limit for the solution algorithm.
        NOTE: This is used by the time limit mechanism to allay unpredictable solution times.
Returns:
    `::Int`: The number of solutions.
        NOTE: This stops counting after reaching 2.
"""
function solutions(board::Board, mask::Matrix{Bool}, start::Float64, limit::Float64)::Int
    nsqr = board.n*board.n
    maskedboard::Matrix{Char} = copy(board.board)
    applymask!(maskedboard, mask)
    solvecount(Board(board.n, maskedboard, board.possible), 1, 1, 0, mask, start, limit)
end

"""
Make a mask for a completed unmasked Sudoku board.
Arguments:
    `board::Board`: The board in question.
    `start::Float64`: The starting time for the running of the generation algorithm in seconds from epoch.
        NOTE: This is used by the time limit mechanism to allay unpredictable generation times.
    `limit::Float64`: The time limit for the generation algorithm.
        NOTE: This is used by the time limit mechanism to allay unpredictable generation times.
Returns:
    `::Union{MaskedBoard, Int}`: If the type is `MaskedBoard`, the solution. Otherwise, it should be -1, which means time limit exceeded.
"""
function makemask(board::Board, start::Float64, limit::Float64)::Union{MaskedBoard, Int}
    mask::Matrix{Bool} = fill(false, (board.n*board.n, board.n*board.n))
    positions = [(row, col) for row in 1:board.n*board.n, col in 1:board.n*board.n] |> shuffle
    for position in positions
        mask[position...] = true
        n_solutions = solutions(board, mask, start, limit)
        if n_solutions == -1 return -1
        elseif n_solutions != 1 mask[position...] = false end
    end
    return MaskedBoard(board, mask)
end

"""
Make a full Sudoku puzzle.
Arguments:
    `n::Int`: The base of the Sudoku board.
Returns:
    `::MaskedBoard`: The board and generated mask.
"""
function makeboard(n::Int)::MaskedBoard
    result = -1
    limit = getlimit(n)
    while result == -1
        result = makemask(make_unmasked(n), time(), limit)
    end
    result
end