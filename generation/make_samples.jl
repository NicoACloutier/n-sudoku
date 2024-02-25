include("generate.jl")
using JSON3

const USED_BASES::Vector{Int} = [4, 5]
const NUM_GENERATED::Int = 25

"""
Make a certain number of samples for a particular base, write to file.
Arguments:
    `base::Int`: The base of the Sudoku board samples.
    `to_generate::Int`: How many to generate.
Returns:
    `Nothing`
        NOTE: This function does not return an output. It writes the generated boards to a file.
"""
function makesamples(base::Int, to_generate::Int)::Nothing
    for i in 11:to_generate
        board = makeboard(base)
        open("samples/$(base)/$(i).json", "w") do file write(file, JSON3.write(board)) end
    end
    return nothing
end

function main()
    for base in USED_BASES makesamples(base, NUM_GENERATED) end
end

main()