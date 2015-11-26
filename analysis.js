"use strict";

window.analyzePar = (function () {

    function analyze(code) {

        // Initialize
        code = code || '';

        // Check code for illegal characters
        var error = '';
        for (var c of code)
            if (allParChars.indexOf(c) === -1)
            error += `Contains illegal character: '${c}'\n`;
        if (error.length !== 0)
            throw new Error(error);

        const stack = [];
        const analysis = [];

        const vars = {
            v: 's',
            w: 's',
            x: 'n',
            y: 'n[',
            z: 's'
        };

        // Parse
        code = code.replace(/  ##[^\n]*(\n|$)/, ' ');
        code = code.replace(/K/g, 'K)');

        const forwards = {};

        function parseForwards(start) {
            for (var i = start; i < code.length; i++) {
                if (code[i] === '`') {
                    for (i++; code[i]; i++) {
                        if (code[i] === '`')
                            break;
                        if (code[i] === '\\') {
                            var next = code[i + 1];
                            if (next === '\\' || next === '`' || next === 'n' || next === 'r' || next === 't')
                                i++;
                        }
                    }
                } else if (code[i] === "'") {
                    i++;
                } else if (code[i] in forwardChars) {
                    var forward = parseForwards(i + 1);
                    forwards[i] = forward;
                    i = forward;
                } else if (code[i] === ')') {
                    return i;
                }
            }
            return code.length;
        }

        function interpretSubprogram(sub, realStart) {

            realStart = realStart || 0;

            for (var i = 0; i < sub.length; i++) {

                const ch = sub[i];

                if (ch === ' ') {

                } else if (ch === "'") {
                    var c = sub[++i];
                    stack.push('s');
                    analysis.push([`'${c}`, `'${c}'`]);
                } else if (ch === '`') {
                    var str = '';
                    var nextChar;
                    var j = i + 1;
                    for (; j < sub.length && (nextChar = sub[j]) !== '`'; j++) {
                        if (nextChar !== '\\') {
                            str += nextChar;
                        } else {
                            var next = sub[++j];
                            if (next === '\\' || next === '`')
                                str += next;
                            else if (next === 'n')
                                str += '\n';
                            else if (next === 'r')
                                str += '\r';
                            else if (next === 't')
                                str += '\t';
                            else
                                j--, str += '\\';
                        }
                    }
                    stack.push('s');
                    analysis.push([`${sub.substring(i, j + 1)}`, `'${str}'`]);
                    i = j;
                } else if (ch === '·' || ch === '´' || (ch === '.' && (sub[i + 1] <= '0' || sub[i + 1] >= '9'))) {
                    i++;
                    const next = sub[i];
                    const arity = arities[next];
                    if (ch === '.') {
                        if (arity === 1) {
                            const arg = stack.length !== 0 ? stack.pop() : (analysis.push(['', '[implicit: read line]']), 's');
                            const iter = iterate(arg);
                            const result = get(chars[next], iter);
                            stack.push(result.type + '[');
                            analysis.push([ch + next, 'Map - ' + result.desc.toLowerCase()]);
                        } else if (arity === 2) {
                            const arg2 = iterate(stack.pop());
                            const arg1 = iterate(stack.pop());
                            const result = get(chars[next], arg1, arg2);
                            stack.push(result.type + '[');
                            analysis.push([ch + next, 'Pairwise - ' + result.desc.toLowerCase()]);
                        }
                    } else if (ch === '·') {
                        if (arity === 1) {
                            const arg = stack.length !== 0 ? stack.pop() : (analysis.push(['', '[implicit: read line]']), 's');
                            const result = get(chars[next], arg);
                            stack.push('n');
                            analysis.push([ch + next, 'Is invariant - ' + result.desc.toLowerCase()]);
                        } else if (arity === 2) {
                            const arg2 = stack.pop();
                            const arg1 = stack.pop();
                            const result = get(chars[next], iterate(arg1), arg2);
                            stack.push(result.type + '[');
                            analysis.push([ch + next, 'Map with right parameter - ' + result.desc.toLowerCase()]);
                        }
                    } else if (ch === '´') {
                        if (arity === 2) {
                            const arg2 = stack.pop();
                            const arg1 = stack.pop();
                            const result = get(chars[next], arg1, iterate(arg2));
                            stack.push(result.type + '[');
                            analysis.push([ch + next, 'Map with left parameter - ' + result.desc.toLowerCase()]);
                        }
                    }
                } else if (ch === '-' && (i === 0 || sub[i - 1] === ' ') && ((sub[i + 1] >= '1' && sub[i + 1] <= '9') || sub[i + 1] === '.')) {
                    var j = i;
                    do j++;
                    while (sub[j] >= '0' && sub[j] <= '9');
                    if (sub[j] === '.')
                        do j++;
                        while (sub[j] >= '0' && sub[j] <= '9');
                    stack.push('n');
                    analysis.push([sub.substring(i, j), sub.substring(i, j).replace('0.', '.')]);
                    i = j - 1;
                } else if (ch === '.') {
                    var j = i + 1;
                    var next = sub[j];
                    if (next >= '0' && next <= '9') {
                        var j = i;
                        do j++;
                        while (sub[j] >= '0' && sub[j] <= '9');
                        stack.push('n');
                        analysis.push([sub.substring(i, j), sub.substring(i + 1, j).replace('0.', '.')]);
                        i = j - 1;
                    }
                } else if (ch === '0') {
                    stack.push('n');
                    analysis.push(['0', '0']);
                } else if (ch === '₁') {
                    if (i > 0 && sub[i - 1] >= '0' && sub[i - 1] <= '9') {
                        var j = i;
                        do j++;
                        while (sub[j] >= '0' && sub[j] <= '9');
                        if (sub[j] === '.' && (sub[j + 1] >= '0' && sub[j + 1] <= '9'))
                            do j++;
                            while (sub[j] >= '0' && sub[j] <= '9');
                        stack.push('n');
                        analysis.push([sub.substring(i, j), +('1' + sub.substring(i + 1, j))]);
                        i = j - 1;
                    } else {
                        stack.pop();
                        analysis.push(['₁', 'Pop from stack']);
                    }
                } else if (ch === '₂') {
                    if (i > 0 && sub[i - 1] >= '0' && sub[i - 1] <= '9') {
                        var j = i;
                        do j++;
                        while (sub[j] >= '0' && sub[j] <= '9');
                        if (sub[j] === '.' && (sub[j + 1] >= '0' && sub[j + 1] <= '9'))
                            do j++;
                            while (sub[j] >= '0' && sub[j] <= '9');
                        stack.push('n');
                        analysis.push([sub.substring(i, j), +('2' + sub.substring(i + 1, j))]);
                        i = j - 1;
                    } else {
                        var top = stack.pop();
                        stack[stack.length - 1] = top;
                        analysis.push(['₂', 'Remove second-to-top of stack']);
                    }
                } else if (ch >= '1' && ch <= '9') {
                    var j = i;
                    do j++;
                    while (sub[j] >= '0' && sub[j] <= '9');
                    if (sub[j] === '.' && (sub[j + 1] >= '0' && sub[j + 1] <= '9'))
                        do j++;
                        while (sub[j] >= '0' && sub[j] <= '9');
                    stack.push('n');
                    analysis.push([sub.substring(i, j), +sub.substring(i, j)]);
                    i = j - 1;
                } else if (ch >= 'V' && ch <= 'Z') {
                    vars[ch.toLowerCase()] = stack[stack.length - 1];
                    analysis.push([ch, `Assign to ${ch.toLowerCase()}`]);
                } else if (ch >= 'v' && ch <= 'z') {
                    stack.push(vars[ch]);
                    analysis.push([ch, `Get ${ch}`]);
                } else if (ch in forwardChars) {
                    analysis.push([ch, forwardChars[ch][0]]);
                    const end = forwards[realStart + i];
                    var analysisSizeStart = analysis.length;
                    forwardChars[ch][1](function () {
                        interpretSubprogram(code.substring(realStart + i + 1, end), realStart + i + 1);
                    });
                    for (var k = analysisSizeStart; k < analysis.length; k++) {
                        analysis[k][0] = ' ' + analysis[k][0];
                    }
                    analysis.push([')', '']);
                    i = end - realStart;
                } else {
                    const arity = arities[ch];
                    if (arity === 0) {
                        const result = get(chars[ch]);
                        stack.push(result.type);
                        analysis.push([ch, result.desc]);

                    } else if (arity === 100) {
                        const result = get(chars[ch]);
                        stack.push(...result.type.split(','));
                        analysis.push([ch, result.desc]);
                    } else if (arity === 1) {
                        const arg1 = stack.length !== 0 ? stack.pop() : (analysis.push(['', '[implicit: read line]']), 's');
                        const result = get(chars[ch], arg1);
                        stack.push(result.type);
                        analysis.push([ch, result.desc]);
                    } else if (arity === 101) {
                        const arg1 = stack.length !== 0 ? stack.pop() : (analysis.push(['', '[implicit: read line]']), 's');
                        const result = get(chars[ch], arg1);
                        stack.push(...result.type.split(','));
                        analysis.push([ch, result.desc]);
                    } else if (arity === 2) {
                        const arg2 = stack.pop();
                        const arg1 = stack.pop();
                        const result = get(chars[ch], arg1, arg2);
                        stack.push(result.type);
                        analysis.push([ch, result.desc]);
                    } else if (arity === 102) {
                        const arg2 = stack.pop();
                        const arg1 = stack.pop();
                        const result = get(chars[ch], arg1, arg2);
                        stack.push(...result.type.split(','));
                        analysis.push([ch, result.desc]);
                    } else if (arity === 3) {
                        const arg3 = stack.pop();
                        const arg2 = stack.pop();
                        const arg1 = stack.pop();
                        const result = get(chars[ch], arg1, arg2, arg3);
                        stack.push(result.type);
                        analysis.push([ch, result.desc]);
                    } else if (arity === 103) {
                        const arg3 = stack.pop();
                        const arg2 = stack.pop();
                        const arg1 = stack.pop();
                        const result = get(chars[ch], arg1, arg2, arg3);
                        stack.push(...result.type.split(','));
                        analysis.push([ch, result.desc]);
                    } else {
                        analysis.push([ch, '']);
                    }
                }
            }
        }

        function matches(args, sign) {
            args = args.split(',');
            sign = sign.split(',');
            if (args.length !== sign.length)
                return false;
            for (var i = 0; i < args.length; i++) {
                if (args[i] === sign[i])
                    continue;
                if (sign[i].contains('T')) {
                    const depth = sign[i].split('[').length - 1;
                    const actual = args[i].substring(0, args[i].length - depth);
                    sign = sign.map(a => a.split('T').join(actual));
                } else if (sign[i].contains('U')) {
                    const depth = sign[i].split('[').length - 1;
                    const actual = args[i].substring(0, args[i].length - depth);
                    sign = sign.map(a => a.split('U').join(actual));
                } else if (sign[i].contains('V')) {
                    const depth = sign[i].split('[').length - 1;
                    const actual = args[i].substring(0, args[i].length - depth);
                    sign = sign.map(a => a.split('V').join(actual));
                } else {
                    return false;
                }
            }
            return true;
        }

        function reify(args, sign, ret) {
            args = args.split(',');
            sign = sign.split(',');
            if (args.length !== sign.length)
                return false;
            for (var i = 0; i < args.length; i++) {
                if (args[i] === sign[i])
                    continue;
                if (sign[i].contains('T')) {
                    const depth = sign[i].split('[').length - 1;
                    const actual = args[i].substring(0, args[i].length - depth);
                    sign = sign.map(a => a.split('T').join(actual));
                    ret = ret.split('T').join(actual);
                } else if (sign[i].contains('U')) {
                    const depth = sign[i].split('[').length - 1;
                    const actual = args[i].substring(0, args[i].length - depth);
                    sign = sign.map(a => a.split('U').join(actual));
                    ret = ret.split('U').join(actual);
                } else if (sign[i].contains('V')) {
                    const depth = sign[i].split('[').length - 1;
                    const actual = args[i].substring(0, args[i].length - depth);
                    sign = sign.map(a => a.split('V').join(actual));
                    ret = ret.split('V').join(actual);
                } else {
                    return false;
                }
            }
            return ret;
        }

        function get(charInfo, ...args) {
            var sig = Object.keys(charInfo).find(sign => matches(args.join(), sign));
            if (sig === undefined)
                sig = Object.keys(charInfo)[0];
            var type = reify(args.join(), sig, charInfo[sig][0]);
            var desc = charInfo[sig][1];
            return { type: type, desc: desc };
        }

        const chars = {
            '': {
                'T': ['T', 'Print']
            },
            '!': {
                'n': ['n', 'Factorial'],
                's': ['s[', 'Permutations'],
                'T[': ['T[[', 'Permutations']
            },
            '%': {
                'n,n': ['n', 'Modulus'],
                's,n': ['s[', 'Split into pieces of size n'],
                's,s': ['s[', 'Split by regular expression'],
                's,T[': ['s', 'Format'],
                'T[,n': ['T[[', 'Split into pieces of size n'],
                'T[,s': ['s', 'Format date'],
                's[,s[': ['s[', 'Complete matrix'],
                'T[[,T[[': ['T[[', 'Complete matrix'],
                'T[[,U[[': ['?[[', 'Complete matrix']
            },
            '&': {
                'n,n': ['n', 'Bitwise-and'],
                's,s': ['s', 'Setwise-and'],
                'T[,T[': ['T[', 'Setwise-and'],
                'T[,U[': ['?[', 'Setwise-and']
            },
            '*': {
                'n,n': ['n', 'Multiply'],
                's,n': ['s', 'Repeat'],
                's,s': ['s[', 'Cartesian product'],
                's,s[': ['s[[', 'Cartesian product'],
                's,T[': ['?[[', 'Cartesian product'],
                'T[,s': ['?[[', 'Cartesian product'],
                'T[,T[': ['T[[', 'Cartesian product'],
                'T[,U[': ['?[[', 'Cartesian product']
            },
            '+': {
                'n,n': ['n', 'Add'],
                's,s': ['s', 'Concatenate'],
                'T[,T[': ['T[', 'Combine'],
                'T[,U[': ['?[', 'Combine']
            },
            ',': {
                'n,T': ['T[', 'Fill new array'],
                's,s': ['n', 'Count'],
                'T[,U': ['n', 'Count']
            },
            '-': {
                'n,n': ['n', 'Subtract'],
                's,s': ['s', 'Remove all'],
                'T[,U': ['T[', 'Remove all']
            },
            '/': {
                'n,n': ['n', 'Divide and truncate'],
                's,n': ['s[', 'Divide into n pieces'],
                's,s': ['s[', 'Split by string'],
                'T[,n': ['T[[', 'Divide into n pieces']
            },
            '<': {
                'T,U': ['n', 'Less than']
            },
            '=': {
                'T,U': ['n', 'Equals']
            },
            '>': {
                'T,U': ['n', 'Greater than']
            },
            '?': {
                'T,U,U': ['T', 'If-then-else'],
                'T,U[,V[': ['?[', 'If-then-else'],
                'T,U,V': ['?', 'If-then-else']
            },
            'K': {
                '': ['', 'Break']
            },
            'L': {
                'n': ['n', 'Natural logarithm'],
                's': ['s', 'Lower-case']
            },
            'N': {
                'n': ['n[', 'Current date and time'],
                's': ['n[', 'Parse date and time'],
                'T[': ['n', 'Milliseconds since epoch']
            },
            'P': {
                'n': ['n', '2 to the power of n'],
                's': ['s[', 'Split by spaces'],
                'T[': ['s', 'Join by spaces']
            },
            'Q': {
                '': ['', 'Quit']
            },
            'S': {
                'n': ['n', 'Base-2 logarithm'],
                's': ['s', 'Sort'],
                'T[': ['T[', 'Sort']
            },
            'T': {
                'n': ['n', '10 to the power of n'],
                's': ['s', 'Title-case'],
                'T[': ['T[', 'Transpose']
            },
            'U': {
                'n': ['n[', '(1 2 ... n)'],
                's': ['s', 'Upper-case']
            },
            '\\': {
                'T,T': ['T[', 'Two-element array'],
                'T,U': ['?[', 'Two-element array']
            },
            ']': {
                'T': ['T[', 'Wrap in array']
            },
            '^': {
                'n,n': ['n', 'Bitwise-xor'],
                's,s': ['s', 'Setwise-xor'],
                'T[,T[': ['T[', 'Setwise-xor'],
                'T[,U[': ['?[', 'Setwise-xor']
            },
            '_': {
                'n': ['n', 'Sign'],
                's': ['s[', 'As array of characters'],
                'n[': ['n[', 'Flatten'],
                'n[[': ['n[', 'Flatten'],
                'n[[[': ['n[', 'Flatten'],
                's[': ['s[', 'Flatten'],
                's[[': ['s[', 'Flatten'],
                's[[[': ['s[', 'Flatten'],
                'T[[[': ['T[', 'Flatten'],
                'T[[': ['T[', 'Flatten'],
                'T[': ['T[', 'Flatten'],
            },
            'g': {
                'n,n': ['n', 'Greatest common denominator'],
                's,n': ['s', 'Get at index'],
                'T[,n': ['T', 'Get at index']
            },
            'h': {
                'n': ['s', 'Decimal to hex'],
                's': ['n', 'Hex to decimal']
            },
            'i': {
                '': ['s', 'Read character']
            },
            'j': {
                'T[,U': ['s', 'Join']
            },
            'k': {
                '': {
                    get 0() {
                        if (stack.length === 0)
                            return 'n[';
                        if (stack.every(e => e === stack[0]))
                            return stack[0] + '[';
                        return '?[';
                    },
                    1: 'Copy of stack',
                    length: 2
                }
            },
            'l': {
                '': ['s', 'Read line']
            },
            'm': {
                'n[': ['n', 'Arithmetic mean']
            },
            'n': {
                '': ['n[', 'Current date and time']
            },
            'o': {
                'n': ['s', 'Character with Unicode value'],
                's': ['n', 'Unicode value']
            },
            'p': {
                'n': ['n[', 'Prime factorization'],
                's': ['s[', 'Powerset'],
                'T[': ['T[[', 'Powerset'],
            },
            'q': {
                'n': ['n', 'Reciprocal'],
                's': ['?[[', 'Frequencies'],
                'n[': ['n[[', 'Frequencies'],
                'T[': ['?[[', 'Frequencies']
            },
            'r': {
                '': ['s', 'Read entire input']
            },
            's': {
                'n,n,n': ['n[', 'Range with step'],
                'n,n,s': ['s', 'Substring'],
                'n,n,T[': ['T[', 'Subarray'],
                's,n,T': ['s', 'Replace character at index'],
                's,s,s': ['s', 'Replace'],
                'T[,n,T': ['T[', 'Set index'],
                'T[,n,U': ['?[', 'Set index'],
                'T,U[,V': ['U[', 'Replace']
            },
            't': {
                'n': ['n', 'Base-10 logarithm'],
                's': ['s', 'Trim'],
                'T[': ['T[', 'Transpose and truncate']
            },
            'u': {
                'n': ['n[', '(0 1 ... n-1)'],
                's': ['s', 'Unique'],
                'T[': ['T[', 'Unique']
            },
            '|': {
                'n,n': ['n', 'Bitwise-or'],
                's,s': ['s', 'Intersection'],
                'T[,T[': ['T[', 'Intersection'],
                'T[,U[': ['?[', 'Intersection']
            },
            '~': {
                'n': ['n', 'Bitwise-not'],
                's': ['n', 'Size'],
                'T[': ['n', 'Size']
            },
            '¡': {
                'T[': ['T,T,T', 'Empty array onto stack']
            },
            '¦': {
                'T': ['s', 'Stringify']
            },
            '«': {
                'n,n': ['n', 'Left bitshift'],
                's,n': ['s', 'Initial substring'],
                'T[,n': ['T[', 'Initial subarray']
            },
            '¬': {
                'T': ['n', 'Not']
            },
            '²': {
                'n': ['n', 'Square'],
                's': ['s[', 'Cartesian square'],
                'T[': ['T[[', 'Cartesian square'],
            },
            '»': {
                'n,n': ['n', 'Right bitshift'],
                's,n': ['s', 'Final substring'],
                'T[,n': ['T[', 'Final subarray']
            },
            '½': {
                'n': ['n', 'Divide by two'],
                's': ['s', 'Middle'],
                'T[': ['T[', 'Middle']
            },
            '÷': {
                'n,n': ['n', 'Divide']
            },
            '˦': {
                'n,n': ['n', 'Max'],
                's,T': ['n', 'First index'],
                'T[,U': ['n', 'First index']
            },
            '˨': {
                'n,n': ['n', 'Min'],
                's,T': ['n', 'Last index'],
                'T[,U': ['n', 'Last index']
            },
            'Σ': {
                'n': ['s', 'Decimal to binary'],
                's': ['n', 'Binary to decimal'],
                'T[': ['T', 'Sum']
            },
            'π': {
                '': ['n', 'Pi']
            },
            '‖': {
                'n': ['n', 'Absolute value'],
                'n[': ['n', 'Euclidean distance']
            },
            '″': {
                'T': ['T,T', 'Duplicate']
            },
            '‴': {
                'T': ['T,T,T', 'Triplicate']
            },
            'ⁿ': {
                'n,n': ['n', 'Exponent'],
                's,n': ['s[', 'Caretesian power'],
                'T[,n': ['T[[', 'Cartesian power']
            },
            '⅓': {
                'T,U,V': ['V,T,U', 'Move top of stack to third']
            },
            '⅔': {
                'T,U,V': ['U,V,T', 'Move third-to-top of stack to top']
            },
            '↑': {
                'n': ['n', 'Plus one'],
                's': ['s', 'First character'],
                'T[': ['T', 'First element']
            },
            '↓': {
                'n': ['n', 'Minus one'],
                's': ['s', 'Last character'],
                'T[': ['T', 'Last element']
            },
            '↔': {
                'T,U': ['U,T', 'Swap']
            },
            '↕': {
                'n,n': ['n[', '(a b ... n)'],
                's,s': ['s', '(a b ... n)']
            },
            '↨': {
                'n,n': ['n[', '(a b ... n-1)'],
                's,s': ['s', '(a b ... n-1)']
            },
            '≠': {
                'T,U': ['n', 'Not equal to']
            },
            '≤': {
                'T,U': ['n', 'Less than or equal to']
            },
            '≥': {
                'T,U': ['n', 'Greater than or equal to']
            },
            '⌐': {
                'n': ['n', 'Negative'],
                's': ['s', 'Reverse'],
                'T[': ['T[', 'Reverse']
            },
            '┐': {
                'n': ['n', 'Ceiling'],
                's': ['s', 'Remove first'],
                'T[': ['T[', 'Remove first']
            },
            '┘': {
                'n': ['n', 'Floor'],
                's': ['s', 'Remove last'],
                'T[': ['T[', 'Remove last']
            },
            '╞': {
                'n,n': ['n[', 'Rotate left'],
                'n,s': ['s', 'Rotate left'],
                'n,T[': ['T[', 'Rotate left'],
                's,T': ['s', 'Append'],
                'T[,T': ['T[', 'Append'],
                'T[,U': ['?[', 'Append']
            },
            '╡': {
                'n,n': ['n[', 'Rotate right'],
                'n,s': ['s', 'Rotate right'],
                'n,T[': ['T[', 'Rotate right'],
                's,T': ['s', 'Prepend'],
                'T[,T': ['T[', 'Prepend'],
                'T[,U': ['?[', 'Prepend']
            },
            '◄': {
                '': {
                    get 0() {
                        const copy = stack.slice();
                        stack.splice(0, stack.length);
                        if (copy.length === 0)
                            return 'n[';
                        if (stack.every(e => e === copy[0]))
                            return copy[0] + '[';
                        return '?[';
                    },
                    1: 'Wrap stack in array',
                    length: 2
                }
            },
            '◘': {
                'n': ['n', 'Random number'],
                's': ['s', 'Shuffle'],
                'T[': ['T[', 'Shuffle']
            },
            '◙': {
                'n': ['n', 'Random integer'],
                's': ['s', 'Random character'],
                'T[': ['T', 'Random element']
            },
            '☺': {
                'n': ['s', 'Hi!']
            },
            '✶': {
                'n': ['n', 'No-op'],
                's': ['?', 'Interpret code'],
                'T[': ['?[', 'Interpret code']
            }
        };

        const forwardChars = {
            '(': ['Construct array', function (go) {
                var stackSize = stack.length;
                go();
                var array = stack.splice(stackSize, stack.length - stackSize);
                if (array.length === 0)
                    stack.push('n[');
                else if (array.every(e => e === array[0]))
                    stack.push(array[0] + '[');
                else
                    stack.push('?[');
            }],
            '@': ['Foreach', function (go) {
                var arg = iterate(stack.pop());
                stack.push(arg);
                go();
            }],
            ':': ['Pairwise', function (go) {
                var arg2 = iterate(stack.pop());
                var arg1 = iterate(stack.pop());
                stack.push(arg1);
                stack.push(arg2);
                go();
                var result = stack.pop() + ']';
                stack.push(result);
            }],
            '[': ['Map', function (go) {
                var arg = iterate(stack.pop());
                stack.push(arg);
                go();
                var result = stack.pop() + '[';
                stack.push(result);
            }],
            '{': ['Map with left parameter', function (go) {
                const arg = iterate(stack.pop());
                const leftParam = stack.pop();
                stack.push(leftParam);
                stack.push(arg);
                go();
                var result = stack.pop() + '[';
                stack.push(result);
            }],
            '}': ['Map with right parameter', function (go) {
                const rightParam = stack.pop();
                const arg = iterate(stack.pop());
                stack.push(arg);
                stack.push(rightParam);
                go();
                var result = stack.pop() + '[';
                stack.push(result);
            }],
            '§': ['Sort by', function (go) {
                var arg = stack.pop();
                var e = iterate(arg);
                stack.push(e);
                go();
                stack.pop();
                if (arg === 'n')
                    stack.push('n[');
                else
                    stack.push(arg);
            }],
            '˄': function (go) {
                var arg = stack.pop();
                if (truthy(arg))
                    go();
                else
                    stack.push(arg);
            },
            '˅': function (go) {
                var arg = stack.pop();
                if (!truthy(arg))
                    go();
                else
                    stack.push(arg);
            },
            '⁞': ['Iterate', function (go) {
                var arg = stack.pop();
                if (arg === 'n') {
                    go();
                } else {
                    var e = iterate(arg);
                    stack.push(e);
                    stack.push('n');
                    go();
                    var result = stack.pop() + ']';
                    stack.push(result);
                }
            }],
            '∫': ['Reduce', function (go) {
                var arg = stack.pop();
                var obj = iterate(arg);
                stack.push(obj);
                stack.push(obj);
                go();
            }],
            '●': function (go) {
                var arg = stack.pop();
                var i = 0;
                var found = false;
                for (var item of iterate(arg)) {
                    stack.push(item);
                    go();
                    if (truthy(stack.pop())) {
                        stack.push(i);
                        found = true;
                        break;
                    }
                    i++;
                }
                if (!found)
                    stack.push(-1);
            },
            '▼': function (go) {
                var arg = stack.pop();
                if (typeof arg === 'string') {
                    var res = '';
                    for (var c of iterate(arg)) {
                        stack.push(c);
                        go();
                        if (truthy(stack.pop()))
                            res += c;
                    }
                    stack.push(res);
                } else {
                    var res = [];
                    for (var item of iterate(arg)) {
                        go();
                        if (truthy(stack.pop()))
                            res.push(item);
                    }
                    stack.push(res);
                }
            },
            '◊': function (go) {
                try {
                    while (truthy(stack.pop()))
                        go();
                } catch (e) {
                    if (!(e instanceof BreakLoop()))
                        throw e;
                }
            },
            '♦': function (go) {
                try {
                    while (truthy(stack[stack.length - 1]))
                        go();
                } catch (e) {
                    if (!(e instanceof BreakLoop()))
                        throw e;
                }
            }
        };

        parseForwards(0);

        interpretSubprogram(code);

        return analysis;
    }

    function iterate(a) {
        if (a.endsWith('['))
            return a.substring(0, a.length - 1);
        return a;
    }

    return analyze;
})();