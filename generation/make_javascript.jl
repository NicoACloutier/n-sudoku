const BASE_DIR::String = "./samples"
const BASES::Vector{Int} = 2:5
const NUM_GENERATED::Int = 25
const OUTPUT_PATH::String = "../src/board.js"

"""
Read file contents for a particular base and `i` value.
Arguments:
    `base::Int`: The base of the Sudoku board.
    `i::Int`: The current value of the Sudoku board.
Returns:
    `::String`: The file contents.
"""
function readfile(base::Int, i::Int)::String
    open(BASE_DIR * "/$(base)/$(i).json", "r") do file return read(file, String) end
end

"""
Make a valid JavaScript string from given base and `i` value file contents.
Arguments:
    `base::Int`: The base of the Sudoku board.
    `i::Int`: The current value of the Sudoku board.
Returns:
    `::String`: A Javascript string containing file contents information.
"""
function makejs(base::Int, i::Int)::String
    "\'$(readfile(base, i))\',\n"
end

function main()::Nothing
    filecontents = ""
    for base in BASES
        filecontents *= "let base_$(base) = ["
        for i in 1:NUM_GENERATED filecontents *= makejs(base, i) end
        filecontents *= "];\n"
    end
    open(OUTPUT_PATH, "w") do file write(file, filecontents) end
    return nothing
end

main()