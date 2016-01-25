StringScanner = function(data, delimiter) {
    this.delimiter = delimiter || "\n";
    this.data = data;
    this.cur = 0;

    //////////////////////
    //PRIVILEGED METHODS//
    //////////////////////
    /*
        set cur value to the position of the next digit or negative sign
        return cur if there is a digit
        return -1 if there is no digit in the remaining string
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

    /*
        check whether the cursor is on the beginning of a negative number
        which means it is on a negative sign and there is a digit directly behind it
        */

    this.isStartOfNegativeNumber = function() {
        return (is_negative_sign(this.current()) && !this.reachedEnd(this.cur + 1) && is_numeric(this.data.charAt(this.cur + 1)));
    }

    this.isDelimiter = function(currentChar) {
        return this.delimiter == currentChar;
    }
}
//////////////////
//PUBLIC METHODS//
//////////////////
/*
    put the cursor back to the initial position 0
*/
StringScanner.prototype.resetCursor = function() {
    this.cur = 0;
}

/*
    check whether the cursor has reached the end of the string given
*/
StringScanner.prototype.reachedEnd = function(pos) {
    var position = pos || this.cur;
    return (position >= this.data.length);
}

/*
   return the next available float number
   return null if none is found before the next delimeter
   return convert it to float and return it if the next number is integer
*/

StringScanner.prototype.nextFloat = function() {
    var integerPart = this.nextInt();
    if (integerPart == null) {
        return null;
    }
    if (this.reachedEnd() || !is_decimal_point(this.data.charAt(this.cur)) || this.isDelimiter(this.current())) {
        return integerPart;
    } else {

        if (!is_numeric(this.data.charAt(this.cur + 1))) {
            return integerPart;
        }
        this.cur++;
        var decimalPart = this.nextInt();
        return parseFloat(integerPart + '.' + decimalPart);
    }

}

/*
   return the next available integer 
   return null if none is found before the next delimeter
   return the integer part if the next number is a float
*/

StringScanner.prototype.nextInt = function() {
    var start = this.moveToStartOfNextNumber();
    if (start == -1) {
        return null;
    }

    if (this.isDelimiter(this.data.charAt(this.cur))) {
        this.cur++;
        return null;
    }
    this.cur++;
    while (!this.reachedEnd()) {
        if (!is_numeric(this.data.charAt(this.cur))) {
            break;
        }
        this.cur++;
    }
    return (parseInt(this.data.substring(start, this.cur)));
}

/*
   return the next available character 
   return NaN if none is found
   return the integer part if the next number is a float
*/

StringScanner.prototype.nextChar = function() {
    if (this.reachedEnd()) {
        return null;
    } else {
        this.cur++;
        return this.data.charAt(this.cur - 1);
    }
}

StringScanner.prototype.next = function() {
    //move to the next non-delimiter character
    while (this.isDelimiter(this.data.charAt(this.cur)) && !this.reachedEnd()) {
        this.cur++;
    }
    if (this.reachedEnd()) {
        return null;
    }
    var start = this.cur;
    while (!this.isDelimiter(this.data.charAt(this.cur)) && !this.reachedEnd()) {
        this.cur++;
    }
    return this.data.substring(start, this.cur);
}

StringScanner.prototype.current = function() {
    return this.data.charAt(this.cur);
}

StringScanner.prototype.previous = function() {
    return this.data.charAt(this.cur - 1);
}

StringScanner.prototype.last = function() {
    return this.data.charAt(this.data.length - 1);
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