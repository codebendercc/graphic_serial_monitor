/** Class for string tokenizing */
StringScanner = function(data, delimiter) {
    this.delimiter = delimiter || "\n";
    this.data = data;
    this.cur = 0;
    this.previousPos = 0;

    //////////////////////
    //PRIVILEGED METHODS//
    //////////////////////

    /**
     * set cur value to the position of the next digit or negative sign
     * @return {number} current position if there is a digit, -1 if there is no digit in the remaining string
     */
    this.moveToStartOfNextNumber = function() {
        while (!this.reachedEnd()) {
            if (is_numeric(this.current())) {
                return this.cur;
            }
            if (this.isDelimiter(this.current())) {
                return this.cur;
            }
            if (this.isStartOfNegativeNumber()) {
                return this.cur;
            }
            this.cur++;
        }
        return -1;
    }

    /**
     * check whether the cursor is on the beginning of a negative number
       which means it is on a negative sign and there is a digit directly behind it
     * @return {boolean}
     */
    this.isStartOfNegativeNumber = function() {
        return (is_negative_sign(this.current()) && !this.reachedEnd(this.cur + 1) && is_numeric(this.data.charAt(this.cur + 1)));
    }

    /**
     * check whether the cursor is on a delimeter
     * @return {boolean}
     */
    this.isDelimiter = function(currentChar) {
        return this.delimiter == currentChar;
    }

    this.getNextDecimalPart = function() {
        var value = 0;
        var count = -1;
        while (!this.reachedEnd()) {
            if (!is_numeric(this.current())) {
                break;
            }
            value += parseInt(this.current()) * Math.pow(10, count);
            count--;
            this.cur++;
        }
        return value;
    }
}
//////////////////
//PUBLIC METHODS//
//////////////////
/**
 * put cursor back to starting position
 */
StringScanner.prototype.resetCursor = function() {
    this.cur = 0;
}

/**
 * check whether the cursor has reached the end of the string
 * @params {number} pos - position user wants to check, default to be current position
 * @return {boolean}
 */
StringScanner.prototype.reachedEnd = function(pos) {
    var position = pos || this.cur;
    return (position >= this.data.length);
}

/**
 * get the next available float number
 * @return {number} will return null if there is no number next
 */
StringScanner.prototype.nextFloat = function() {
    this.previousPos = this.cur;
    var integerPart = this.nextInt();
    if (integerPart == null) {
        return null;
    }
    if (this.reachedEnd() || !is_decimal_point(this.current()) || this.isDelimiter(this.current())) {
        return integerPart;
    }
    this.cur++;
    if (!is_numeric(this.current())) {
        return integerPart;
    }
    var decimalPart = this.getNextDecimalPart();
    if (is_positive(integerPart)) {
        return integerPart + decimalPart;
    }
    return integerPart - decimalPart;
}

/**
 * get the next available integer
 * @return {number} will return null if there is no integer next
 */
StringScanner.prototype.nextInt = function() {
    this.previousPos = this.cur;
    var start = this.moveToStartOfNextNumber();
    if (start == -1) {
        return null;
    }
    if (this.isDelimiter(this.current())) {
        this.cur++;
        return null;
    }
    this.cur++;
    while (!this.reachedEnd()) {
        if (!is_numeric(this.current())) {
            break;
        }
        this.cur++;
    }
    return (parseInt(this.data.substring(start, this.cur)));
}

/**
 * get the next available character
 * @return {string} will return null if there is no character left
 */
StringScanner.prototype.nextChar = function() {
    if (this.reachedEnd()) {
        return null;
    } else {
        this.cur++;
        return this.data.charAt(this.cur - 1);
    }
}

/**
 * get the next string segment before the next delimeter
 * @return {string} will return null if there is nothing left
 */
StringScanner.prototype.next = function() {
    //move to the next non-delimiter character
    while (this.isDelimiter(this.current()) && !this.reachedEnd()) {
        this.cur++;
    }
    if (this.reachedEnd()) {
        return null;
    }
    var start = this.cur;
    while (!this.isDelimiter(this.current()) && !this.reachedEnd()) {
        this.cur++;
    }
    return this.data.substring(start, this.cur);
}

/**
 * get the current character
 * @return {string}
 */
StringScanner.prototype.current = function() {
    return this.data.charAt(this.cur);
}

/**
 * get the character before the cursor
 * @return {string} if the cursor is at the start, return null
 */
StringScanner.prototype.previous = function() {
    if (this.cur == 0) return null;
    return this.data.charAt(this.cur - 1);
}

/**
 * get the last character of the string
 * @return {string}
 */
StringScanner.prototype.last = function() {
    return this.data.charAt(this.data.length - 1);
}

/**
 * get the remaining characters of the string
 * @return {string}
 */
StringScanner.prototype.remaining = function() {
    return this.data.substring(this.cur);
}

StringScanner.prototype.rollback = function() {
    this.cur = this.previousPos;
}
/////////////////////
//UTILITY FUNCTIONS//
/////////////////////

function is_decimal_point(char) {
    return char == '.';
}

function is_negative_sign(char) {
    return char == '-';
}

function is_numeric(char) {
    return !isNaN(parseInt((char)));
}

function is_positive(number) {
    return (1 / number > 0); // so that -0 will be recognized as negative
}