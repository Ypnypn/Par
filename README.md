#Par

Par is a stack-based language based on CJam and Pyth. <a href="http://ypnypn.github.io/Par/index.html">Try it now</a>.

Par is implemented in JavaScript and run entirely client-side. It has been tested well in Firefox and somewhat in Chrome, but does not work at all in Internet Explorer.

You can run the official test suite on your browser by visiting http://ypnypn.github.io/Par/tests.html.

##The encoding

Par uses less than 256 characters, from across the Unicode range.    

On the website, you can simply type these characters from the keyboard, or use the buttons on the right of the page.    

Alternatively, you can use a hex-editor on your computer, and then upload a `.par` file.    

For example, the following hex file:    

    1a 02

refers to the twenty-seventh button on the webpage (`9`), followed by the third (`!`). This encodes the program `9!`, which calculates 9 factorial, or 362880.    

Thus, this encoding uses only one byte per character. A consequence of this is that only those characters on the webpage can be used in Par. For example, the tab character can not be used, even in string literals.    

##The language

A Par program places values on the stack and performs operations on them.    

There are three common datatypes - numbers, strings, and arrays.    

Number literals mean what they are. If a literal starts with <code>0</code>, the next character begins a new number. When following a number literal, `₁` and `₂` also begin new literals.    

    12 034₁5            -- pushes 12, 0, 34, 15

String literals begin and end with `\``, with `\\` used to escape. Single-character literals can be made with `'`.

    `abc`'d`e\`\t\\f`   -- pushes "abc", "d", and "e`     \f"
	
Arrays can be created with the `(` operator, Lisp-style.    

    (2 3`abc`()         -- pushes (2 3 abc ())