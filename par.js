"use strict";

window.interpretPar = (function () {

    function interpret(code, input, options) {

        // Initialize
        code = code || '';
        input = input || '';
        options = options || {};

        // Check code for illegal characters
        var error = '';
        for (var c of code)
            if (allParChars.indexOf(c) === -1)
            error += `Contains illegal character: '${c}'\n`;
        if (error.length !== 0)
            throw new Error(error);

        const getInput = options.input || function () {
            if (input.length === 0)
                return null;
            const first = input[0];
            input = input.substring(1);
            return first;
        }

        var output = '';
        const setOutput = options.output || function (a) { output += a; };

        const stack = options.stack || [];

        const vars = options.vars || {
            v: '',
            w: '\n',
            x: 10,
            y: [],
            z: ' '
        };

        const isSub = !!options.isSub;

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
                    stack.push(sub[++i]);
                } else if (ch === '`') {
                    var str = '';
                    var nextChar;
                    for (i++; i < sub.length && (nextChar = sub[i]) !== '`'; i++) {
                        if (nextChar !== '\\') {
                            str += nextChar;
                        } else {
                            var next = sub[++i];
                            if (next === '\\' || next === '`')
                                str += next;
                            else if (next === 'n')
                                str += '\n';
                            else if (next === 'r')
                                str += '\r';
                            else if (next === 't')
                                str += '\t';
                            else
                                i--, str += '\\';
                        }
                    }
                    stack.push(str);
                } else if (ch === '·' || ch === '´' || (ch === '.' && (sub[i + 1] <= '0' || sub[i + 1] >= '9'))) {
                    i++;
                    const next = sub[i];
                    const arity = arities[next];
                    if (ch === '.') {
                        if (arity === 1) {
                            const arg = stack.length !== 0 ? stack.pop() : chars['l']();
                            stack.push([...iterate(arg)].map(chars[next]));
                        } else if (arity === 2) {
                            const arg2 = [...iterate(stack.pop())];
                            const arg1 = [...iterate(stack.pop())];
                            stack.push(arg1.map((e, k) => chars[next](e, arg2[k % arg2.length])));
                        }
                    } else if (ch === '·') {
                        if (arity === 1) {
                            const arg = stack.length !== 0 ? stack.pop() : chars['l']();
                            stack.push(+(compare(arg, chars[next](arg)) === 0));
                        } else if (arity === 2) {
                            const arg2 = stack.pop();
                            const arg1 = stack.pop();
                            stack.push([...iterate(arg1)].map(e => chars[next](e, arg2)));
                        }
                    } else if (ch === '´') {
                        if (arity === 2) {
                            const arg2 = stack.pop();
                            const arg1 = stack.pop();
                            stack.push([...iterate(arg2)].map(e => chars[next](arg1, e)));
                        }
                    }
                } else if (ch === '-' && (i === 0 || sub[i - 1] === ' ') && (sub[i + 1] >= '1' && sub[i + 1] <= '9')) {
                    var j = i;
                    do j++;
                    while (sub[j] >= '0' && sub[j] <= '9');
                    if (sub[j] === '.')
                        do j++;
                        while (sub[j] >= '0' && sub[j] <= '9');
                    stack.push(+sub.substring(i, j));
                    i = j - 1;
                } else if (ch === '.') {
                    var j = i + 1;
                    var next = sub[j];
                    if (next >= '0' && next <= '9') {
                        var j = i;
                        do j++;
                        while (sub[j] >= '0' && sub[j] <= '9');
                        stack.push(+sub.substring(i, j));
                        i = j - 1;
                    }
                } else if (ch === '0') {
                    stack.push(0);
                } else if (ch === '₁') {
                    if (i > 0 && sub[i - 1] >= '0' && sub[i - 1] <= '9') {
                        var j = i;
                        do j++;
                        while (sub[j] >= '0' && sub[j] <= '9');
                        if (sub[j] === '.' && (sub[j + 1] >= '0' && sub[j + 1] <= '9'))
                            do j++;
                            while (sub[j] >= '0' && sub[j] <= '9');
                        stack.push(+('1' + sub.substring(i + 1, j)));
                        i = j - 1;
                    } else {
                        stack.pop();
                    }
                } else if (ch === '₂') {
                    if (i > 0 && sub[i - 1] >= '0' && sub[i - 1] <= '9') {
                        var j = i;
                        do j++;
                        while (sub[j] >= '0' && sub[j] <= '9');
                        if (sub[j] === '.' && (sub[j + 1] >= '0' && sub[j + 1] <= '9'))
                            do j++;
                            while (sub[j] >= '0' && sub[j] <= '9');
                        stack.push(+(`2${sub.substring(i + 1, j)}`));
                        i = j - 1;
                    } else {
                        var top = stack.pop();
                        stack[stack.length - 1] = top;
                    }
                } else if (ch >= '1' && ch <= '9') {
                    var j = i;
                    do j++;
                    while (sub[j] >= '0' && sub[j] <= '9');
                    if (sub[j] === '.' && (sub[j + 1] >= '0' && sub[j + 1] <= '9'))
                        do j++;
                        while (sub[j] >= '0' && sub[j] <= '9');
                    stack.push(+sub.substring(i, j));
                    i = j - 1;
                } else if (ch >= 'V' && ch <= 'Z') {
                    vars[ch.toLowerCase()] = stack[stack.length - 1];
                } else if (ch >= 'v' && ch <= 'z') {
                    stack.push(vars[ch]);
                } else if (ch in forwardChars) {
                    const end = forwards[realStart + i];
                    forwardChars[ch](function () {
                        interpretSubprogram(code.substring(realStart + i + 1, end), realStart + i + 1);
                    });
                    i = end - realStart;
                } else {
                    const arity = arities[ch];
                    if (arity === 0) {
                        const result = chars[ch]();
                        stack.push(result);
                    } else if (arity === 100) {
                        const result = chars[ch]();
                        stack.push(...result);
                    } else if (arity === 1) {
                        const arg1 = stack.length !== 0 ? stack.pop() : chars['l']();
                        const result = chars[ch](arg1);
                        stack.push(result);
                    } else if (arity === 101) {
                        const arg1 = stack.length !== 0 ? stack.pop() : chars['l']();
                        const result = chars[ch](arg1);
                        stack.push(...result);
                    } else if (arity === 2) {
                        const arg2 = stack.pop();
                        const arg1 = stack.pop();
                        const result = chars[ch](arg1, arg2);
                        stack.push(result);
                    } else if (arity === 102) {
                        const arg2 = stack.pop();
                        const arg1 = stack.pop();
                        const result = chars[ch](arg1, arg2);
                        stack.push(...result);
                    } else if (arity === 3) {
                        const arg3 = stack.pop();
                        const arg2 = stack.pop();
                        const arg1 = stack.pop();
                        const result = chars[ch](arg1, arg2, arg3);
                        stack.push(result);
                    } else if (arity === 103) {
                        const arg3 = stack.pop();
                        const arg2 = stack.pop();
                        const arg1 = stack.pop();
                        const result = chars[ch](arg1, arg2, arg3);
                        stack.push(...result);
                    } else {
                        throw new Error(`unrecognized symbol: '${ch}'`);
                    }
                }
            }
        }

        const chars = {
            '\n': function (a) {
                setOutput(a);
                return a;
            },
            '!': function (a) {
                if (typeof a === 'number') {
                    const num = Math.abs(a | 0);
                    var res = 1;
                    for (var i = 1; i <= num; i++)
                        res *= i;
                    return res;
                }

                function strPermute(str) {
                    if (str.length === 1)
                        return [str];
                    if (str.length === 0)
                        return [];
                    return [].concat(...[...str].map((c, i) => strPermute(str.substring(0, i) +str.substring(i +1)).map(s => c +s)));
                }

                if (typeof a === 'string') {
                    return strPermute(a);
                }

                function arrPermute(arr) {
                    if (arr.length === 1)
                        return [arr];
                    if (arr.length === 0)
                        return [];
                    return [].concat(...arr.map((e, i) => arrPermute(arr.slice(0, i).concat(arr.slice(i +1))).map(s =>[e].concat(s))));
                }

                if (Array.isArray(a)) {
                    return arrPermute(a);
                }
            },
            '%': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number') {
                    return a % b;
                }
                if (typeof a === 'string' && typeof b === 'number') {
                    var arr = Array(Math.ceil(a.length / b));
                    for (var ind = 0; ind < arr.length; ind++)
                        arr[ind] = a.substring(ind * b, (ind + 1) * b);
                    return arr;
                }
                if (typeof a === 'string' && typeof b === 'string') {
                    return a.split(RegExp(b));
                }
                if (typeof a === 'string' && Array.isArray(b)) {
                    var pieces = a.split('·');
                    var res = '';
                    for (var k = 0; k < pieces.length - 1; k++)
                        res += pieces[k] + b[k % b.length];
                    return res + pieces[pieces.length - 1];
                }
                if (Array.isArray(a) && typeof b === 'number') {
                    var arr = Array(Math.ceil(a.length / b));
                    for (var ind = 0; ind < arr.length; ind++)
                        arr[ind] = a.slice(ind * b, (ind + 1) * b);
                    return arr;
                }
                if (Array.isArray(a) && typeof b === 'string') {
                    return dateFormat(a, b);
                }
                if (Array.isArray(a) && Array.isArray(b)) {
                    const maxSize = Math.max(...a.map(e => e.length));
                    const ret = Array(a.length);
                    if (typeof a[0] === 'string') {
                        for (var i = 0; i < a.length; i++) {
                            var sub = a[i];
                            const bSub = b[i % b.length];
                            for (var j = 0; j < maxSize - a[i].length; j++)
                                sub += bSub[j % bSub.length];
                            ret[i] = sub;
                        }
                    } else {
                        for (var i = 0; i < a.length; i++) {
                            const sub = a[i].slice();
                            const bSub = b[i % b.length];
                            for (var j = 0; j < maxSize - a[i].length; j++)
                                sub.push(bSub[j % bSub.length]);
                            ret[i] = sub;
                        }
                    }
                    return ret;
                }
            },
            '&': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number')
                    return a & b;
                if (typeof a === 'string' && typeof b === 'string') {
                    var temp = b.slice();
                    var ret = '';
                    for (var c of a) {
                        var index = temp.indexOf(c);
                        if (index !== -1) {
                            ret += c;
                            temp = temp.slice(0, index) + temp.slice(index + 1);
                        }
                    }
                    return ret;
                }
                if (Array.isArray(a) && Array.isArray(b)) {
                    var temp = b.slice();
                    var ret = [];
                    for (var o of a) {
                        var index = temp.findIndex(e => typeof e === typeof o && compare(e, o) === 0);
                        if (index !== -1) {
                            ret.push(o);
                            temp.splice(index, 1);
                        }
                    }
                    return ret;
                }
            },
            '*': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number')
                    return a * b;
                if (typeof a === 'string' && typeof b === 'number') {
                    if (b < 0) {
                        a = strReverse(a);
                        b = -b;
                    }
                    return a.repeat(b) + a.substring(0, (b - (b | 0)) * a.length);
                }
                if (typeof a === 'string' && typeof b === 'string') {
                    const res = [];
                    for (var c1 of a)
                        for (var c2 of b)
                            res.push(c1 + c2);
                    return res;
                }
                if ((Array.isArray(a) && (typeof b === 'string' || Array.isArray(b))) || (typeof a === 'string' && Array.isArray((b)))) {
                    var arr1 = typeof a === 'string' ? [...a] : a;
                    var arr2 = typeof b === 'string' ? [...b] : b;
                    const res = [];
                    for (var o1 of arr1)
                        for (var o2 of arr2)
                            res.push([o1, o2]);
                    return res;
                }
                if (Array.isArray(a) && typeof b === 'number') {
                    if (b < 0) {
                        a = a.reverse();
                        b = -b;
                    }
                    var arr = Array(a.length * b | 0);
                    for (var index = 0; index < arr.length; index++)
                        arr[index] = a[index % a.length];
                    return arr;
                }
            },
            '+': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number')
                    return a + b;
                if (typeof a === 'string' && typeof b === 'string')
                    return a + b;
                if (Array.isArray(a) && Array.isArray(b))
                    return a.concat(b);
            },
            ',': function (a, b) {
                if (typeof a === 'number')
                    return Array(a).fill(b, 0, a);
                if (typeof a === 'string' && typeof b === 'string')
                    return a.split(b).length - 1;
                if (Array.isArray(a))
                    return a.filter(function (e) { return typeof e === typeof b && compare(e, b) === 0; }).length;
            },
            '-': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number') {
                    return a - b;
                }
                if (typeof a === 'string' && typeof b === 'string') {
                    return a.split(b).join('');
                }
                if (Array.isArray(a)) {
                    var ret = [];
                    for (var o of a)
                        if (typeof o !== typeof b || compare(o, b) !== 0)
                        ret.push(o);
                    return ret;
                }
            },
            '/': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number')
                    return (a - a % b) / b;
                if (typeof a === 'string' && typeof b === 'number') {
                    const ret = Array(b);
                    const subSize = a.length / b | 0;
                    var extra = a.length % b;
                    for (var ind = 0; ind < a.length % b; ind++)
                        ret[ind] = a.slice(ind * (subSize + 1), (ind + 1) * (subSize + 1));
                    for (var ind = a.length % b; ind < b; ind++)
                        ret[ind] = a.slice(ind * subSize + extra, (ind + 1) * subSize + extra);
                    return ret;
                }
                if (typeof a === 'string' && typeof b === 'string')
                    return a.split(b);
                if (Array.isArray(a) && typeof b === 'number') {
                    const ret = Array(b);
                    const subSize = a.length / b | 0;
                    var extra = a.length % b;
                    for (var ind = 0; ind < a.length % b; ind++)
                        ret[ind] = a.slice(ind * (subSize + 1), (ind + 1) * (subSize + 1));
                    for (var ind = a.length % b; ind < b; ind++)
                        ret[ind] = a.slice(ind * subSize + extra, (ind + 1) * subSize + extra);
                    return ret;
                }
            },
            '<': function (a, b) {
                return +(compare(a, b) < 0)
            },
            '=': function (a, b) {
                return +(compare(a, b) === 0);
            },
            '>': function (a, b) {
                return +(compare(a, b) > 0);
            },
            '?': function (a, b, c) {
                return truthy(a) ? b : c;
            },
            'K': function () {
                throw new BreakLoop();
            },
            'L': function (a) {
                if (typeof a === 'number')
                    return Math.log(a);
                if (typeof a === 'string')
                    return a.toLowerCase();
            },
            'N': function (a) {
                if (typeof a === 'number') {
                    const date = new Date(a);
                    return [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
                }
                if (typeof a === 'string') {
                    const date = new Date(a);
                    return [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
                }
                if (Array.isArray(a)) {
                    const date = new Date(...a);
                    return date.getTime();
                }
            },
            'P': function (a) {
                if (typeof a === 'number')
                    return Math.pow(2, a);
                if (typeof a === 'string')
                    return a.split(' ');
                if (Array.isArray(a))
                    return a.join(' ');
            },
            'Q': function () {
                throw new ProgramOver();
            },
            'S': function (a) {
                if (typeof a === 'number') {
                    return Math.log2(a);
                }
                if (typeof a === 'string') {
                    var arr = [...a];
                    arr.sort();
                    return arr.join('');
                }
                if (Array.isArray(a)) {
                    var ret = a.slice();
                    ret.sort();
                    return ret;
                }
            },
            'T': function (a) {
                if (typeof a === 'number') {
                    return Math.pow(10, a);
                }
                if (typeof a === 'string') {
                    return a.split(' ').map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                }
                if (Array.isArray(a)) {
                    if (a.length === 0)
                        return a;
                    if (typeof a[0] === 'string') {
                        const maxSize = Math.max(...a.map(b => b.length));
                        var ret = [];
                        for (var i = 0; i < maxSize; i++) {
                            var str = '';
                            for (var b of a)
                                if (i < b.length)
                                str += b[i];
                            ret.push(str);
                        }
                        return ret;
                    }
                    if (Array.isArray(a[0])) {
                        const maxSize = Math.max(...a.map(b => b.length));
                        if (maxSize === 0)
                            return [];
                        var ret = [];
                        for (var i = 0; i < maxSize; i++) {
                            ret.push(a.filter(b => i in b).map(b => b[i]));
                        }
                        return ret;
                    }
                }
            },
            'U': function (a) {
                if (typeof a === 'number') {
                    if (a >= 0) {
                        var arr = Array(Math.ceil(a));
                        for (var i = 0; i < arr.length; i++)
                            arr[i] = i + 1;
                        return arr;
                    } else {
                        var arr = Array(Math.ceil(-a));
                        for (var i = 0; i < arr.length; i++)
                            arr[i] = -i - 1;
                        return arr;
                    }
                }
                if (typeof a === 'string')
                    return a.toUpperCase();
            },
            '\\': function (a, b) {
                return [a, b];
            },
            ']': function (a) {
                return [a];
            },
            '^': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number')
                    return a ^ b;
                if (typeof a === 'string' && typeof b === 'string') {
                    var c = a;
                    var d = b;
                    for (var i = c.length - 1; i >= 0; i--) {
                        var dInd = d.lastIndexOf(c[i]);
                        if (dInd !== -1) {
                            c = c.slice(0, i) + c.slice(i + 1);
                            d = d.slice(0, dInd) + d.slice(dInd + 1);
                        }
                    }
                    return c + d;
                }
                if (Array.isArray(a) && Array.isArray(b)) {
                    var c = a.slice();
                    var d = b.reverse();
                    for (var i = c.length - 1; i >= 0; i--) {
                        var dInd = d.findIndex(e => typeof e === typeof c[i] && compare(e, c[i]) === 0);
                        if (dInd !== -1) {
                            c.splice(i, 1);
                            d.splice(dInd, 1);
                        }
                    }
                    return c.concat(d.reverse());
                }
            },
            '_': function (a) {
                if (typeof a === 'number')
                    return Math.sign(a);

                if (typeof a === 'string')
                    return [...a];

                function flatten(arr) {
                    const res = [];
                    for (var e of arr)
                        if (Array.isArray(e))
                        res.push(...flatten(e));
                    else
                        res.push(e);
                    return res;
                }

                if (Array.isArray(a))
                    return flatten(a);
            },
            'g': function (a, b) {
                function gcd(u, v) {
                    return v ? gcd(v, u % v) : u;
                }

                if (typeof a === 'number' && typeof b === 'number') {
                    return Math.abs(gcd(a, b));
                }
                if (typeof a === 'string' && typeof b === 'number') {
                    const size = a.length;
                    return a[(b % size + size) % size];
                }
                if (Array.isArray(a) && typeof b === 'number') {
                    const size = a.length;
                    return a[(b % size + size) % size];
                }
            },
            'h': function (a) {
                if (typeof a === 'number')
                    return a.toString(16).toUpperCase();
                if (typeof a === 'string')
                    return parseInt(a, 16);
            },
            'i': function () {
                return getInput();
            },
            'j': function (a, b) {
                return a.map(e => stringify(e)).join(b);
            },
            'k': function () {
                return stack.slice();
            },
            'l': function () {
                var ret = '';
                var first;
                while ((first = getInput()) !== '\n' && first !== null)
                    ret += first;
                return ret;
            },
            'm': function (a) {
                if (Array.isArray(a))
                    return a.reduce((a, b) => a + b) / a.length;
            },
            'n': function () {
                var now = new Date();
                return [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()];
            },
            'o': function (a) {
                if (typeof a === 'number')
                    return String.fromCharCode(a);
                if (typeof a === 'string')
                    return a.charCodeAt(0);
            },
            'p': function (a) {
                if (typeof a === 'number') {
                    var num = Math.abs(a | 0);
                    if (num < 2)
                        return [a | 0];
                    var factors = a === num ? [] : [-1];
                    for (var prime of[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]) {
                        while (num % prime === 0) {
                            factors.push(prime);
                            num /= prime;
                        }
                        if (num === 1)
                            return factors;
                    }
                    for (var divisor = 101; divisor * divisor <= num; divisor += 2) {
                        while (num % divisor === 0) {
                            factors.push(divisor);
                            num /= divisor;
                        }
                    }
                    if (num === 1)
                        return factors;
                    factors.push(num);
                    return factors;
                }
                if (typeof a === 'string') {
                    var arr = [...a];
                    var resultSize = 1 << a.length;
                    var result = Array(resultSize);
                    for (var i = 0; i < resultSize; i++) {
                        result[i] = arr.filter((c, j) => (1 << j) & i).join('');
                    }
                    return result;
                }
                if (Array.isArray(a)) {
                    var resultSize = 1 << a.length;
                    var result = Array(resultSize);
                    for (var i = 0; i < resultSize; i++) {
                        result[i] = a.filter((e, j) => (1 << j) & i);
                    }
                    return result;
                }
            },
            'q': function (a) {
                if (typeof a === 'number') {
                    return 1 / a;
                }
                if (typeof a === 'string') {
                    const map = {};
                    for (var c of a)
                        if (c in map)
                        map[c]++;
                    else
                        map[c] = 1;
                    const ret = [];
                    for (var key in map)
                        ret.push([key, map[key]]);
                    ret.sort((x, y) => y[1] - x[1] || compare(x[0], y[0]));
                    return ret;
                }
                if (Array.isArray(a)) {
                    const ret = [];
                    for (var e of a) {
                        var index = ret.findIndex(p => typeof p[0] === typeof e && compare(p[0], e) === 0);
                        if (index !== -1)
                            ret[index][1]++;
                        else
                            ret.push([e, 1]);
                    }
                    ret.sort((x, y) => y[1] - x[1] || compare(x[0], y[0]));
                    return ret;
                }
            },
            'r': function () {
                var ret = '';
                var first;
                while ((first = getInput()) !== null)
                    ret += first;
                return ret;
            },
            's': function (a, b, c) {
                if (typeof a === 'number' && typeof b === 'number' && typeof c === 'number') {
                    var step = a < b ? Math.abs(c) : -Math.abs(c);
                    var arr = Array((b - a) / step + 1 | 0);
                    for (var i = 0; i < arr.length; i++)
                        arr[i] = a + i * step;
                    return arr;
                }
                if (typeof a === 'number' && typeof b === 'number' && typeof c === 'string') {
                    var size = c.length;
                    var start = (a % size + size) % size;
                    var stop = (b % size + size) % size;
                    if (stop >= start)
                        return c.slice(start, stop);
                    else
                        return strReverse(c.slice(stop + 1, start + 1));
                }
                if (typeof a === 'number' && typeof b === 'number' && Array.isArray(c)) {
                    var size = c.length;
                    var start = (a % size + size) % size;
                    var stop = (b % size + size) % size;
                    if (stop >= start)
                        return c.slice(start, stop);
                    else
                        return c.slice(stop + 1, start + 1).reverse();
                }
                if (typeof a === 'string' && typeof b === 'number') {
                    var size = a.length;
                    var index = (b % size + size) % size;
                    return a.substring(0, index) + c + a.substring(index + 1);
                }
                if (typeof a === 'string' && typeof b === 'string' && typeof c === 'string') {
                    return b.split(a).join(c);
                }
                if (Array.isArray(a) && typeof b === 'number') {
                    var size = a.length;
                    var ret = a.slice();
                    ret[(b % size + size) % size] = c;
                    return ret;
                }
                if (Array.isArray(b)) {
                    var ret = b.slice();
                    var size = b.length;
                    for (var i = 0; i < size; i++)
                        if (typeof a === typeof b[i] && compare(a, b[i]) === 0)
                            ret[i] = c;
                    return ret;
                }
            },
            't': function (a) {
                if (typeof a === 'number') {
                    return Math.log10(a);
                }
                if (typeof a === 'string') {
                    return a.trim();
                }
                if (Array.isArray(a)) {
                    if (a.length === 0)
                        return a;
                    if (typeof a[0] === 'string') {
                        const minSize = Math.min(...a.map(b => b.length));
                        if (minSize === 0)
                            return [];
                        var ret = [];
                        for (var i = 0; i < minSize; i++) {
                            var str = '';
                            for (var b of a)
                                str += b[i];
                            ret.push(str);
                        }
                        return ret;
                    }
                    if (Array.isArray(a[0])) {
                        const minSize = Math.min(...a.map(b => b.length));
                        if (minSize === 0)
                            return [];
                        var ret = [];
                        for (var i = 0; i < minSize; i++)
                            ret.push(a.map(b => b[i]));
                        return ret;
                    }
                }
            },
            'u': function (a) {
                if (typeof a === 'number') {
                    if (a >= 0) {
                        var arr = Array(Math.ceil(a))
                        for (var i = 0; i < arr.length; i++)
                            arr[i] = i;
                        return arr;
                    } else {
                        var arr = Array(Math.ceil(-a));
                        for (var i = 0; i < arr.length; i++)
                            arr[i] = -i;
                        return arr;
                    }
                }
                if (typeof a === 'string') {
                    var ret = '';
                    for (var c of a)
                        if (ret.indexOf(c) === -1)
                        ret += c;
                    return ret;
                }
                if (Array.isArray(a)) {
                    var ret = [];
                    for (var c of a)
                        if (ret.every(b => typeof b !== typeof c || compare(b, c) !== 0))
                        ret.push(c);
                    return ret;
                }
            },
            '|': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number')
                    return a | b;
                if (typeof a === 'string' && typeof b === 'string') {
                    var temp = b;
                    var ret = '';
                    for (var c of a) {
                        ret += c;
                        var index = temp.lastIndexOf(c);
                        if (index !== -1) {
                            temp = temp.slice(0, index) + temp.slice(index + 1);
                        }
                    }
                    return ret + temp;
                }
                if (Array.isArray(a) && Array.isArray(b)) {
                    var temp = b.reverse();
                    var ret = [];
                    for (var o of a) {
                        ret.push(o);
                        var index = temp.findIndex(e => typeof e === typeof o && compare(e, o) === 0);
                        if (index !== -1) {
                            temp.splice(index, 1);
                        }
                    }
                    return ret.concat(temp.reverse());
                }
            },
            '~': function (a) {
                if (typeof a === 'number')
                    return ~a;
                if (typeof a === 'string')
                    return a.length;
                if (Array.isArray(a))
                    return a.length;
            },
            '¡': function (a) {
                if (Array.isArray(a))
                    return a;
            },
            '¦': function (a) {
                return stringify(a);
            },
            '«': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number')
                    return a << b;
                if (typeof a === 'string' && typeof b === 'number')
                    return b >= 0 ? a.slice(0, b) : a.slice(a.length + b);
                if (Array.isArray(a) && typeof b === 'number')
                    return b >= 0 ? a.slice(0, b) : a.slice(a.length + b);
            },
            '¬': function (a) {
                return +!truthy(a);
            },
            '²': function (a) {
                return chars['*'](a, a);
            },
            '»': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number')
                    return a >> b;
                if (typeof a === 'string' && typeof b === 'number')
                    return b >= 0 ? a.slice(a.length - b) : a.slice(0, -b);
                if (Array.isArray(a) && typeof b === 'number')
                    return b >= 0 ? a.slice(a.length - b) : a.slice(0, -b);
            },
            '½': function (a) {
                if (typeof a === 'number')
                    return a / 2;
                if (typeof a === 'string')
                    return a.slice(Math.ceil(a.length / 2 - 1), Math.floor((a.length) / 2 + 1));
                if (Array.isArray(a))
                    return a.slice(Math.ceil(a.length / 2 - 1), Math.floor((a.length) / 2 + 1));
            },
            '÷': function (a, b) {
                return a / b;
            },
            '˦': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number')
                    return Math.max(a, b);
                if (typeof a === 'string')
                    return a.indexOf(stringify(b));
                if (Array.isArray(a))
                    return a.findIndex(e => typeof e === typeof b && compare(e, b) === 0);
            },
            '˨': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number')
                    return Math.min(a, b);
                if (typeof a === 'string')
                    return a.lastIndexOf(stringify(b));
                if (Array.isArray(a))
                    return a.length - a.reverse().findIndex(e => typeof e === typeof b && compare(e, b) === 0) - 1;
            },
            'Σ': function (a) {
                if (typeof a === 'number')
                    return a.toString(2);
                if (typeof a === 'string')
                    return parseInt(a, 2);
                if (Array.isArray(a))
                    return a.reduce(chars['+']);
            },
            'π': function () {
                return Math.PI;
            },
            '‖': function (a) {
                if (typeof a === 'number')
                    return Math.abs(a);
                if (Array.isArray(a))
                    return Math.hypot(...a);
            },
            '″': function (a) {
                return [a, a];
            },
            '‴': function (a) {
                return [a, a, a];
            },
            'ⁿ': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number') {
                    return Math.pow(a, b);
                }
                if (typeof a === 'string' && typeof b === 'number') {
                    const size = Math.pow(a.length, b);
                    const ret = Array(size);
                    for (var i = 0; i < size; i++) {
                        var str = '';
                        var k = i;
                        for (var j = 0; j < b; j++) {
                            str = a[k % a.length] + str;
                            k = (k / a.length) | 0;
                        }
                        ret[i] = str;
                    }
                    return ret;
                }
                if (Array.isArray(a) && typeof b === 'number') {
                    const size = Math.pow(a.length, b);
                    const ret = Array(size);
                    for (var i = 0; i < size; i++) {
                        var arr = Array(b);
                        var k = i;
                        for (var j = 0; j < b; j++) {
                            arr[b - j - 1] = a[k % a.length];
                            k = (k / a.length) | 0;
                        }
                        ret[i] = arr;
                    }
                    return ret;
                }
            },
            '⅓': function (a, b, c) {
                return [c, a, b];
            },
            '⅔': function (a, b, c) {
                return [b, c, a];
            },
            '↑': function (a) {
                if (typeof a === 'number')
                    return a + 1;
                if (typeof a === 'string')
                    return a[0];
                if (Array.isArray(a))
                    return a[0];
            },
            '↓': function (a) {
                if (typeof a === 'number')
                    return a - 1;
                if (typeof a === 'string')
                    return a[a.length - 1];
                if (Array.isArray(a))
                    return a[a.length - 1];
            },
            '↔': function (a, b) {
                return [b, a];
            },
            '↕': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number') {
                    const size = Math.abs(b - a) + 1;
                    const arr = Array(size);
                    if (b >= a)
                        for (var ind = 0; ind < size; ind++)
                            arr[ind] = a + ind;
                    else
                        for (var ind = 0; ind < size; ind++)
                            arr[ind] = a - ind;
                    return arr;
                }
                if (typeof a === 'string' && typeof b === 'string') {
                    const oA = a.charCodeAt(0);
                    const oB = b.charCodeAt(0);
                    const size = Math.abs(oB - oA) + 1;
                    var str = '';
                    if (oB >= oA)
                        for (var ind = 0; ind < size; ind++)
                            str += String.fromCharCode(oA + ind);
                    else
                        for (var ind = 0; ind < size; ind++)
                            str += String.fromCharCode(oA - ind);
                    return str;
                }
            },
            '↨': function (a, b) {
                if (typeof a === 'number' && typeof b === 'number') {
                    const size = Math.abs(b - a);
                    const arr = Array(size);
                    if (b >= a)
                        for (var ind = 0; ind < size; ind++)
                            arr[ind] = a + ind;
                    else
                        for (var ind = 0; ind < size; ind++)
                            arr[ind] = a - ind;
                    return arr;
                }
                if (typeof a === 'string' && typeof b === 'string') {
                    const oA = a.charCodeAt(0);
                    const oB = b.charCodeAt(0);
                    const size = Math.abs(oB - oA);
                    var str = '';
                    if (oB >= oA)
                        for (var ind = 0; ind < size; ind++)
                            str += String.fromCharCode(oA + ind);
                    else
                        for (var ind = 0; ind < size; ind++)
                            str += String.fromCharCode(oA - ind);
                    return str;
                }
            },
            '≠': function (a, b) {
                return +(compare(a, b) !== 0);
            },
            '≤': function (a, b) {
                return +(compare(a, b) <= 0);
            },
            '≥': function (a, b) {
                return +(compare(a, b) >= 0);
            },
            '⌐': function (a) {
                if (typeof a === 'number')
                    return -a;
                if (typeof a === 'string')
                    return strReverse(a);
                if (Array.isArray(a))
                    return a.reverse();
            },
            '┐': function (a) {
                if (typeof a === 'number')
                    return Math.ceil(a);
                if (typeof a === 'string')
                    return a.slice(1);
                if (Array.isArray(a))
                    return a.slice(1);
            },
            '┘': function (a) {
                if (typeof a === 'number')
                    return Math.floor(a);
                if (typeof a === 'string')
                    return a.slice(0, -1);
                if (Array.isArray(a))
                    return a.slice(0, -1);
            },
            '╞': function (a, b) {
                if (typeof a === 'number') {
                    const size = b.length || Math.abs(b);
                    const rotate = (a % size + size) % size;
                    if (typeof b === 'number') {
                        var ret = Array(size);
                        if (b >= 0)
                            for (var i = 0; i < size; i++)
                                ret[i] = i < size - rotate ? i + rotate : i + rotate - size;
                        else
                            for (var i = 0; i < size; i++)
                                ret[i] = i < size - rotate ? -i - rotate : -i - rotate + size;
                        return ret;
                    }
                    if (typeof b === 'string') {
                        return b.slice(a) + b.slice(0, a);
                    }
                    if (Array.isArray(b)) {
                        return b.slice(a).concat(b.slice(0, a));
                    }
                }
                if (typeof a === 'string') {
                    return a + stringify(b);
                }
                if (Array.isArray(a)) {
                    var ret = a.slice();
                    ret.push(b);
                    return ret;
                }
            },
            '╡': function (a, b) {
                if (typeof a === 'number') {
                    const size = b.length || Math.abs(b);
                    const rotate = (a % size + size) % size;
                    if (typeof b === 'number') {
                        var ret = Array(size);
                        if (b >= 0)
                            for (var i = 0; i < size; i++)
                                ret[i] = i < rotate ? i + size - rotate : i - rotate;
                        else
                            for (var i = 0; i < size; i++)
                                ret[i] = i < rotate ? -i - size + rotate : -i + rotate;
                        return ret;
                    }
                    if (typeof b === 'string') {
                        return b.slice(0, a) + b.slice(a);
                    }
                    if (Array.isArray(b)) {
                        return b.slice(0, a).concat(b.slice(a));
                    }
                }
                if (typeof a === 'string') {
                    return stringify(b) + a;
                }
                if (Array.isArray(a)) {
                    var ret = a.slice();
                    ret.unshift(b);
                    return ret;
                }
            },
            '◄': function () {
                const copy = stack.slice();
                stack.splice(0, stack.length);
                return copy;
            },
            '◘': function (a) {
                if (typeof a === 'number')
                    return Math.random() * a;

                // adapted from http://stackoverflow.com/a/2450976/3148067 
                // cc by-sa 3.0
                function shuffle(array) {
                    for (var currentIndex = array.length; currentIndex !== 0;) {
                        const randomIndex = Math.random() * currentIndex | 0;
                        currentIndex--;
                        const temporaryValue = array[currentIndex];
                        array[currentIndex] = array[randomIndex];
                        array[randomIndex] = temporaryValue;
                    }
                    return array;
                }

                if (typeof a === 'string')
                    return shuffle([...a]).join('');
                if (Array.isArray(a))
                    return shuffle(a);
            },
            '◙': function (a) {
                function rand(num) {
                    return Math.random() * num | 0;
                }

                if (typeof a === 'number')
                    return rand(a);
                if (typeof a === 'string')
                    return a[rand(a.length)];
                if (Array.isArray(a))
                    return a[rand(a.length)];
            },
            '☺': function (a) {
                var str = a % 2 ? 'Hello, world' : 'Hello world';
                if (a % 6 === 2 || a % 6 === 3)
                    return str + '.';
                if (a % 6 === 4 || a % 6 === 5)
                    return str + '!';
                return str;
            },
            '✶': function (a) {
                interpret(stringify(a), input, { getInput: getInput, setOutput: setOutput, stack: stack, isSub: true });
                return [];
            }
        };

        const forwardChars = {
            '(': function (go) {
                var stackSize = stack.length;
                go();
                var array = stack.splice(stackSize, stack.length - stackSize);
                stack.push(array);
            },
            '@': function (go) {
                var arg = stack.pop();
                try {
                    for (var item of iterate(arg)) {
                        stack.push(item);
                        go();
                    }
                } catch (e) {
                    if (!(e instanceof BreakLoop))
                        throw e;
                }
            },
            ':': function (go) {
                var arg2 = [...iterate(stack.pop())];
                var arg1 = [...iterate(stack.pop())];
                var i = 0;
                try {
                    for (; i < arg1.length; i++) {
                        stack.push(arg1[i], arg2[i % arg2.length]);
                        go();
                    }
                } catch (e) {
                    if (!(e instanceof BreakLoop))
                        throw e;
                }
                var result = stack.splice(stack.length - i, i);
                stack.push(result);
            },
            '[': function (go) {
                var arg = iterate(stack.pop());
                var i = 0;
                try {
                    for (var e of arg) {
                        stack.push(e);
                        go();
                        i++;
                    }
                } catch (e) {
                    if (!(e instanceof BreakLoop))
                        throw e;
                }
                var result = stack.splice(stack.length - i, i);
                stack.push(result);
            },
            '{': function (go) {
                const arg = iterate(stack.pop());
                const leftParam = stack.pop();
                var i = 0;
                try {
                    for (var e of arg) {
                        stack.push(leftParam);
                        stack.push(e);
                        go();
                        i++;
                    }
                } catch (e) {
                    if (!(e instanceof BreakLoop))
                        throw e;
                }
                var result = stack.splice(stack.length - i, i);
                stack.push(result);
            },
            '}': function (go) {
                const rightParam = stack.pop();
                const arg = iterate(stack.pop());
                var i = 0;
                try {
                    for (var e of arg) {
                        stack.push(e);
                        stack.push(rightParam);
                        go();
                        i++;
                    }
                } catch (e) {
                    if (!(e instanceof BreakLoop))
                        throw e;
                }
                var result = stack.splice(stack.length - i, i);
                stack.push(result);
            },
            '§': function (go) {
                var arg = stack.pop();
                var arr = [...arg];
                var vals = [];
                for (var val of arr) {
                    stack.push(val);
                    go();
                    vals.push([val, stack.pop()]);
                }
                vals.sort((a, b) => compare(a[1], b[1]));
                var res = vals.map(e => e[0]);
                stack.push(typeof arg === 'string' ? res.join('') : res);
            },
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
            '⁞': function (go) {
                var arg = stack.pop();
                if (typeof arg === 'number') {
                    for (var i = 0; i < arg; i++) {
                        try {
                            go();
                        } catch (e) {
                            if (!(e instanceof BreakLoop))
                                throw e;
                        }
                    }
                } else {
                    var i = 0;
                    try {
                        for (var e of arg) {
                            stack.push(e);
                            stack.push(i);
                            go();
                            i++;
                        }
                    } catch (e) {
                        if (!(e instanceof BreakLoop))
                            throw e;
                    }
                    var result = stack.splice(stack.length - i, i);
                    stack.push(result);
                }
            },
            '∫': function (go) {
                var arg = stack.pop();
                var arr = [...iterate(arg)];
                if (arr.length !== 0) {
                    stack.push(arr[0]);
                    for (var item of arr.slice(1)) {
                        stack.push(item);
                        go();
                    }
                }
            },
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

        try {
            interpretSubprogram(code);
        } catch (e) {
            if (isSub || !(e instanceof ProgramOver))
                throw e;
        }

        return [stack, output];
    }

    /* HELPER FUNCTIONS */

    function truthy(o) {
        return o && !(Array.isArray(o) && o.length === 0);
    }

    function compare(a, b) {
        if (Array.isArray(a) && Array.isArray(b)) {
            for (var i = 0; i < a.length && i < b.length; i++) {
                var comp = compare(a[i], b[i]);
                if (comp !== 0)
                    return comp;
            }
            return a.length - b.length;
        } else {
            return a > b ? 1 : a < b ? -1 : 0;
        }
    }

    function iterate(a) {
        if (typeof a === 'number')
            return new Function('a', 'return function * () {                \
                                            if (a >= 0)                     \
                                                for (var i = 0; i < a; i++) \
                                                    yield i;                \
                                            else                            \
                                                for (var i = 0; i > a; i--) \
                                                    yield i;                \
                                        }                                       ')(a)();
        return a;
    }

    function strReverse(s) {
        var ret = '';
        for (var i = s.length; i-- > 0;) {
            ret += s[i];
        }
        return ret;
    }

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formatOptions = {
        A: d => d[4] < 12 ? 'AM' : 'PM',
        a: d => d[4] < 12 ? 'am' : 'pm',
        D: d => d[2] >= 10 ? d[2] : '0' + d[2],
        d: d => d[2],
        H: d => d[3] >= 10 ? d[3] : '0' + d[3],
        h: d => d[3],
        L: d => d[6] >= 100 ? d[6] : d[6] >= 10 ? '0' + d[6] : '00' + d[6],
        l: d => (d[6] >= 100 ? '' + d[6] : d[6] >= 10 ? '0' + d[6] : '00' + d[6]).replace(/0+$/, ''),
        M: d => months[d[1]],
        m: d => months[d[1]].substring(0, 3),
        N: d => d[4] >= 10 ? d[4] : '0' + d[4],
        n: d => d[4],
        O: d => d[1] >= 9 ? d[1] + 1 : '0' + (d[1] + 1),
        o: d => d[1] + 1,
        S: d => d[5] >= 10 ? d[5] : '0' + d[5],
        s: d => d[5],
        W: d => days[new Date(d[0], d[1], d[2], d[3]).getDay()],
        w: d => days[new Date(d[0], d[1], d[2], d[3]).getDay()].substring(0, 3),
        x: d => new Date(d[0], d[1], d[2], d[3]).getDay(),
        Y: d => d[0],
        y: d => d[0] % 100
    };

    function dateFormat(date, format) {
        var result = '';
        for (var i = 0; i < format.length; i++) {
            if (format[i] === '\\')
                result += format[++i];
            else if (format[i] in formatOptions)
                result += formatOptions[format[i]](date);
            else
                result += format[i];
        }
        return result;
    }

    function ProgramOver() { }

    function BreakLoop() { }

    return interpret;
})();

const allParChars =
    '\n !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~' +
    '¡¦§«¬²´·»½÷˄˅˦˨Σπ‖″‴⁞ⁿ₁₂⅓⅔↑↓↔↕↨∫≠≤≥⌐┐┘╞╡▼◄◊●◘◙☺♦✶';

const arities = {
    '\n': 1,
    '!': 1,
    '%': 2,
    '&': 2,
    '(': 200,
    '*': 2,
    '+': 2,
    ',': 2,
    '-': 2,
    '/': 2,
    ':': 202,
    '<': 2,
    '=': 2,
    '>': 2,
    '?': 3,
    '@': 201,
    'K': 100,
    'L': 1,
    'N': 1,
    'P': 1,
    'Q': 100,
    'S': 1,
    'T': 1,
    'U': 1,
    '[': 201,
    '\\': 2,
    ']': 1,
    '^': 2,
    '_': 1,
    'g': 2,
    'h': 1,
    'i': 0,
    'j': 2,
    'k': 0,
    'l': 0,
    'm': 1,
    'n': 0,
    'o': 1,
    'p': 1,
    'q': 1,
    'r': 0,
    's': 3,
    't': 1,
    'u': 1,
    '{': 202,
    '|': 2,
    '}': 202,
    '~': 1,
    '¡': 101,
    '¦': 1,
    '§': 201,
    '«': 2,
    '¬': 1,
    '²': 1,
    '»': 2,
    '½': 1,
    '÷': 2,
    '˄': 201,
    '˅': 201,
    '˦': 2,
    '˨': 2,
    'Σ': 1,
    'π': 0,
    '‖': 1,
    '″': 101,
    '‴': 101,
    '⁞': 201,
    'ⁿ': 2,
    '⅓': 103,
    '⅔': 103,
    '↑': 1,
    '↓': 1,
    '↔': 102,
    '↕': 2,
    '↨': 2,
    '∫': 201,
    '≠': 2,
    '≤': 2,
    '≥': 2,
    '⌐': 1,
    '┐': 1,
    '┘': 1,
    '╞': 2,
    '╡': 2,
    '▼': 201,
    '◄': 0,
    '◊': 200,
    '●': 201,
    '◘': 1,
    '◙': 1,
    '☺': 1,
    '♦': 200,
    '✶': 101
};

function stringify(val) {
    if (Array.isArray(val))
        return '(' + val.map(stringify).join(' ') + ')';
    if (typeof val === 'number' && val > -1 && val < 1)
        return (val + '').replace('0.', '.');
    return val + '';
}