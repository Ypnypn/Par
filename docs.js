const documentation = {
    '\n': {
        '?': 'Print and keep `a`'
    },
    '!': {
        'n': 'Factorial of `a`',
        's': 'Permutations of `a`',
        'a': 'Permutations of `a`'
    },
    '%': {
        'nn': '`a` modulo `b`',
        'sn': '`a` split into substrings of length `b`',
        'ss': '`a` split by regular expression `b`',
        'sa': '`a` with each `·` replaced by an element of `b`',
        'an': '`a` split into sub-arrays of length `b`',
        'as': 'Time represented by `a`, formatted with `b`',
        'aa': 'Matrix `a` completed with `b`'
    },
    '&': {
        'nn': 'Bitwise-and of `a` and `b`',
        'ss': 'Intersection of `a` and `b`, in order of appearance in `a`',
        'aa': 'Intersection of `a` and `b`, in order of appearance in `a`'
    },
    '\'': {
        '': 'Single-character string'
    },
    '(': {
        '': 'Collect in array'
    },
    '*': {
        'nn': '`a` times `b`',
        'sn': '`a` repeated `b` times',
        'ss': 'Cartesian product of `a` and `b`',
        'sa': 'Cartesian product of `a` and `b`',
        'an': '`a` repeated `b` times',
        'as': 'Cartesian product of `a` and `b`',
        'aa': 'Cartesian product of `a` and `b`'
    },
    '+': {
        'nn': '`a` plus `b`',
        'ss': 'Concatenation of `a` and `b`',
        'aa': 'Concatenation of `a` and `b`'
    },
    ',': {
        'n?': 'Array with `a` instances of `b`',
        'ss': 'Number of occurances of `b` within `a`',
        'a?': 'Number of occurances of `b` in `a`'
    },
    '-': {
        'nn': '`a` minus `b`',
        'ss': '`a`, with each `b` removed',
        'a?': '`a`, with each `b` removed'
    },
    '.': {
        '': 'Numeric literal, or map, or pairwise'
    },
    '/': {
        'nn': '`a` divided by `b`, truncated to integer',
        'sn': '`a` split into `b` substrings',
        'ss': '`a` split by `b`',
        'an': '`a` split into `b` sub-arrays'
    },
    ':': {
        '??': 'Execute for each of `a` and `b`, and wrap in array'
    },
    '<': {
        '??': '`a` is less than `b`'
    },
    '=': {
        '??': '`a` equals `b`'
    },
    '>': {
        '??': '`a` is greater than `b`'
    },
    '?': {
        '???': 'If `a`, then `b`, else `c`'
    },
    '@': {
        '?': 'Execute for each of `a`'
    },
    'K': {
        '': 'Break out of loop (`@`, `◊`, `♦`)'
    },
    'L': {
        'n': 'Natural logarithm of `a`',
        's': '`a` in lower case'
    },
    'N': {
        'n': 'Year, month, day, hour, minute, second, millisecond of time `a` milliseconds past epoch',
        's': 'Year, month, day, hour, minute, second, millisecond of time represented by `a`',
        'a': 'Milliseconds since epoch of time represented by `a`'
    },
    'P': {
        'n': '2 to the power of `a`',
        's': '`a` split by spaces',
        'a': 'Elements of `a` joined with spaces'
    },
    'Q': {
        '': 'End the program'
    },
    'S': {
        'n': 'Base-2 logarithm of `a`',
        's': 'Sorted characters of `a`',
        'a': 'Sorted elements of `a`'
    },
    'T': {
        'n': 'Ten to the power of `a`',
        's': 'Each word of `a` capitalized',
        'a': '`a` transposed'
    },
    'U': {
        'n': 'Integers from 1 (inclusive) to `a` (inclusive)',
        's': '`a` in upper case'
    },
    'V': {
        '': 'Set to `v`'
    },
    'W': {
        '': 'Set to `w`'
    },
    'X': {
        '': 'Set to `x`'
    },
    'Y': {
        '': 'Set to `y`'
    },
    'Z': {
        '': 'Set to `z`'
    },
    '[': {
        '?': 'Map `a`'
    },
    '\\': {
        '??': 'Array containing `a` and `b`'
    },
    ']': {
        '?': 'Array containing just `a`'
    },
    '^': {
        'nn': 'Bitwise-xor of `a` and `b`',
        'ss': 'Characters of `a` not in `b`, then characters of `b` not in `a`',
        'aa': 'Elements of `a` not in `b`, then elements of `b` not in `a`'
    },
    '_': {
        'n': 'Sign of `a`',
        's': 'Array of characters of `a`',
        'a': '`a` flattened'
    },
    '`': {
        '': 'String literal, with `\\` used to escape'
    },
    'g': {
        'nn': 'Greatest common denominator of `a` and `b`',
        'sn': 'The `b`\'th character of `a`',
        'an': 'The `b`\'th element of `a`'
    },
    'h': {
        'n': '`a` in hexadecimal',
        's': '`a`, treated as hexacidemal'
    },
    'j': {
        'as': 'Elements of `a` joined with `b`'
    },
    'i': {
        '': 'One character from input'
    },
    'k': {
        '': 'Entire stack'
    },
    'l': {
        '': 'One line from input'
    },
    'm': {
        'a': 'Arithmetic mean of `a`'
    },
    'n': {
        '': 'Current year, month, day, hour, minute, second, millisecond'
    },
    'o': {
        'n': 'Character with Unicode value `a`',
        's': 'Unicode value of `a`'
    },
    'p': {
        'n': 'Prime factors of `a`',
        's': 'All combinations of characters of `a`',
        'a': 'All combinations of elements of `a`'
    },
    'q': {
        'n': 'Reciprocal of `a`',
        's': 'All distinct characters of `a` with frequencies',
        'a': 'All distinct elements of `a` with frequencies'
    },
    'r': {
        '': 'Entire input'
    },
    's': {
        'nnn': 'Numbers from `a` (inclusive) to `b` (inclusive), with a step of `c`',
        'nns': 'Characters from index `a` (inclusive) to `b` (exclusive) of `c`',
        'nna': 'Elements from index `a` (inclusive) to `b` (exclusive) of `c`',
        'sn?': '`a`, with the `b`\'th character replaced with `c`',
        'sss': '`b`, with each `a` replaced with `c`',
        'an?': '`a`, with the `b`\'th element replaced with `c`',
        '?a?': '`b`, with each `a` replaced with `c`'
    },
    't': {
        'n': 'Base-10 logarithm of `a`',
        's': '`a` with leading and trailing whitespace removed',
        'a': '`a` transposed, truncated'
    },
    'u': {
        'n': 'Integers from 0 (inclusive) until `a` (exclusive)',
        's': 'Unique characters of `a`, in order of first appearance',
        'a': 'Unique elements of `a`, in order of first appearance'
    },
    'v': {
        '': 'Variable (initialized to empty string)'
    },
    'w': {
        '': 'Variable (initialized to newline)'
    },
    'x': {
        '': 'Variable (initialized to 10)'
    },
    'y': {
        '': 'Variable (initialized to empty array)'
    },
    'z': {
        '': 'Variable (initialized to space)'
    },
    '{': {
        '??': 'Map `b` with left-parameter `a`'
    },
    '|': {
        'nn': 'Bitwise-or of `a` and `b`',
        'ss': 'Union of `a` and `b`, in the order of `a` followed by remaining characters of `b`',
        'aa': 'Union of `a` and `b`, in the order of `a` followed by remaining elements of `b`'
    },
    '}': {
        '??': 'Map `a` with right-parameter `b`'
    },
    '~': {
        'n': 'Bitwise-not of `a`',
        's': 'Length of `a`',
        'a': 'Length of `a`'
    },
    '¡': {
        'a': 'Elements of `a`, separately'
    },
    '¦': {
        '?': '`a` as string'
    },
    '§': {
        '?': 'Sort `a`'
    },
    '«': {
        'nn': '`a` shifted left by `b`',
        'sn': 'First `b` characters of `b`',
        'an': 'First `b` elements of `b`'
    },
    '¬': {
        '?': 'Logical not of `a`'
    },
    '²': {
        'n': 'Square of `a`',
        's': 'Cartesian product of `a` and itself',
        'a': 'Cartesian product of `a` and itself'
    },
    '´': {
        '': 'Map with left-parameter'
    },
    '·': {
        '': 'Immutable, or map with right-parameter'
    },
    '»': {
        'nn': '`a` shifted right by `b`',
        'sn': 'Last `b` characters of `b`',
        'an': 'Last `b` elements of `b`'
    },
    '½': {
        'n': '`a` divided by two',
        's': 'Medians of `a`',
        'a': 'Medians of `a`'
    },
    '÷': {
        'nn': '`a` divided by `b`'
    },
    '˄': {
        '?': 'If `a` is false, leave on stack; otherwise, execute'
    },
    '˅': {
        '?': 'If `a` is true, leave on stack; otherwise, execute'
    },
    '˦': {
        'nn': 'Larger of `a` and `b`',
        's?': 'First index of `b` in `a`',
        'a?': 'First index of `b` in `a`',
    },
    '˨': {
        'nn': 'Smaller of `a` and `b`',
        's?': 'Last index of `b` in `a`',
        'a?': 'Last index of `b` in `a`',
    },
    'Σ': {
        'n': '`a` in binary',
        's': '`a`, treated as binary',
        'a': 'Sum of elements of `a`'
    },
    'π': {
        '': 'Pi'
    },
    '‖': {
        'n': 'Absolute value of `a`',
        'a': 'Square root of sum of squares of numbers in `a`',
    },
    '″': {
        '?': 'Two copies of `a`'
    },
    '‴': {
        '?': 'Three copies of `a`'
    },
    '⁞': {
        'n': 'Execute `a` times',
        's': 'Map `a` with iteration',
        'a': 'Map `a` with iteration'
    },
    'ⁿ': {
        'nn': '`a` to the power of `b`',
        'sn': '`b`-ary cartesian power of `a`',
        'an': '`b`-ary cartesian power of `a`'
    },
    '₁': {
        '': 'If preceded by a numeral, begin a new number starting with 1; otherwise, remove top of stack'
    },
    '₂': {
        '': 'If preceded by a numeral, begin a new number starting with 2; otherwise, remove second-to-top of stack'
    },
    '⅓': {
        '???': '`c`, then `a`, then `b`'
    },
    '⅔': {
        '???': '`b`, then `c`, then `a`'
    },
    '↑': {
        'n': '`a` plus one',
        's': 'First character of `a`',
        'a': 'First element of `a`'
    },
    '↓': {
        'n': '`a` minus one',
        's': 'Last character of `a`',
        'a': 'Last element of `a`'
    },
    '↔': {
        '??': '`b`, then `a`'
    },
    '↕': {
        'nn': 'Integers from `a` (inclusive) to `b` (inclusive)',
        'ss': 'Characters from `a` (inclusive) to `b` (inclusive)'
    },
    '↨': {
        'nn': 'Integers from `a` (inclusive) to `b` (exclusive)',
        'ss': 'Characters from `a` (inclusive) to `b` (exclusive)'
    },
    '∫': {
        '?': 'Reduce `a`'
    },
    '≠': {
        '??': '`a` is not equal to `b`'
    },
    '≤': {
        '??': '`a` is less than or equal to `b`'
    },
    '≥': {
        '??': '`a` is greater than or equal to `b`'
    },
    '⌐': {
        'n': 'Opposite of `a`',
        's': 'Reverse of `a`',
        'a': 'Reverse of `a`'
    },
    '┐': {
        'n': 'Smallest integer not greater than `a`',
        's': '`a` without its first character',
        'a': '`a` without its first eleemnt'
    },
    '┘': {
        'n': 'Greatest integer not less than `a`',
        's': '`a` without its last character',
        'a': '`a` without its last eleemnt'
    },
    '╞': {
        'n?': '`b` rotated `a` places to the left',
        's?': '`a` concatenated with `b`',
        'a?': '`a` with `b` inserted at the end'
    },
    '╡': {
        'n?': '`b` rotated `a` places to the right',
        's?': '`b` concatenated with `a`',
        'a?': '`a` with `b` inserted at the beginng'
    },
    '▼': {
        '?': 'Filter `a`'
    },
    '◄': {
        '': 'Wrap stack in array'
    },
    '◊': {
        '': 'While, and discard condition'
    },
    '●': {
        '?': 'Find first index of `a` where true (equivalent to foreach-if-break)'
    },
    '◘': {
        'n': 'Random number between zero and `a`',
        's': 'Random permutation of `a`',
        'a': 'Random permutation of `a`'
    },
    '◙': {
        'n': 'Random integer between zero and `a`',
        's': 'Random character of `a`',
        'a': 'Random element of `a`'
    },
    '♦': {
        '': 'While, and keep condition'
    },
    '✶': {
        '?': 'Execute Par code'
    },
};