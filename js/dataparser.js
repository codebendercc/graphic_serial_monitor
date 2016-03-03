/** parse raw string data and store it into processable nested arrays */
GraphiteDataParser = function() {
    //store all processed data
    //2D-array of integers - [[set of simultanous data],[..],[..]...]
    this.dataStorage = [];
    //format of data 
    //please use the constants provided instead of integers
    this.dataFormat = GraphiteDataParser.ONE_LINER_TYPE;
    //the index of the last number 'displayed' using method showNewData()
    this.currentDisplayedIndex = 0;
    //1-D integer array of values scraped from raw data that is not ready to put into storage
    this.pendingData = [];
    //number of data types,which determines number of lines on the linear graph 
    this.dataNumber = 1;
    //indicates whether the first of the data is used as the x-coordinate
    this.withXCord = true;
    //store incomplete data segement from the previous raw data stream
    //for example: "xxxxxx 1.2" or "xxxxx 1."
    this.incompleteNumberSegment = null;

    /////////////////////
    //PROTECTED METHODS//
    /////////////////////
    /**
     * assume the string follows one-liner format and process
     * @params {string} rawData - raw string data
     */
    this.processOneLinerFormat = function(rawData) {
        if (this.incompleteNumberSegment != null) {
            rawData = this.incompleteNumberSegment + rawData;
            this.incompleteNumberSegment = null;
        }
        //if the raw data consists of more than one line, it's not one-liner format
        if (rawData.indexOf("\n") > -1) {
            this.dataFormat = GraphiteDataParser.MULTI_LINE_TYPE;
            this.currentDisplayedIndex = 0;
            //put all the current data as pending, (processed as the single-data-type format)
            this.pendingData = flatten(this.dataStorage);
            this.dataStorage = [];
            this.processMultilineFormat(rawData);
            return;
        }
        var scanner = new StringScanner(rawData);
        var value;
        while (value = scanner.nextFloat()) {
            if (scanner.reachedEnd()){
                this.processIncompleteSegment(scanner);
                break;
            }
            this.dataStorage.push([value]);
        }
        this.checkNegativeSignEnding(scanner);
    }

    /**
     * assume the string follows multiline format and process
     * @params {string} rawData - raw string data
     */
    this.processMultilineFormat = function(rawData) {
        if (this.incompleteNumberSegment != null) { //theres incomplete segment from previous data stream
            rawData = this.incompleteNumberSegment + rawData;
            this.incompleteNumberSegment = null;
        }
        var scanner = new StringScanner(rawData);
        var value;
        while (!scanner.reachedEnd()) {
            value = scanner.nextFloat();
            if (value == null) {
                if (scanner.data.charAt(scanner.cur - 1) == '\n') {
                    this.dataNumber = this.pendingData.length;
                    this.dataStorage.push(this.pendingData);
                    this.pendingData = [];
                    if (this.withXCord) {
                        this.hasIncrementalX();
                    }
                    continue;
                }
            }
            if (scanner.reachedEnd()){
                this.processIncompleteSegment(scanner);
                break;
            }
            this.pendingData.push(value);
        }
        this.checkNegativeSignEnding(scanner);
    }

    /**
     * check whether the current data ends with a negative sign
     * @return {boolean}
     */
    this.checkNegativeSignEnding = function(scanner) {
        if (scanner.last() == '-') {
            this.incompleteNumberSegment = '-';
        }
    }

    /**
     * check whether the current data stream has reached end and it ends with (potentially) incomplete data
       if has incomplete data, put it in incompleteSegment
     *
     */
    this.processIncompleteSegment = function(scanner) {
        scanner.rollback();
        console.log(scanner.cur);
        this.incompleteNumberSegment = scanner.remaining();
    }

    this.isWithXCord = function() {
        if (this.dataNumber > 1) {
            return this.withXCord;
        }
        return false;
    }

    /**
     * check whether the data stream has an x-axis (assumed to be )
     */
    this.hasIncrementalX = function() {
        //there is only one or less line
        if (this.dataStorage.length <= 1) {
            return;
        }
        if (this.dataStorage[this.dataStorage.length - 1][0] < this.dataStorage[this.dataStorage.length - 2][0]) {
            this.withXCord = false;
        }
    }
}

/////////////////////
//STATIC ATTRIBUTES//
/////////////////////
/*ONE_LINER_TYPE example:
temperature:1 temperature:2 temperature:3 temperature:4 temperature:5
*/
GraphiteDataParser.ONE_LINER_TYPE = 0;
/*SINGLE_DATA_TYPE example:
temperature: 1
temperature: 2
temperature: 3
temperature: 4
*/
GraphiteDataParser.MULTI_LINE_TYPE = 1;
/*MULTI_DATA_WITH_X example:
time: 1 temperature: 2 pressure: 31
time: 2 temperature: 5 pressure: 11
time: 3 temperature: 6 pressure: 23
time: 4 temperature: 2 pressure: 23
time: 5 temperature: 4 pressure: 43
*/

GraphiteDataParser.MULTI_DATA_WITH_X = 2; //not yet implemented

/**
 * add new raw string into the parser
 */
GraphiteDataParser.prototype.addRawData = function(rawData) {
    switch (this.dataFormat) {
        case GraphiteDataParser.ONE_LINER_TYPE:
            this.processOneLinerFormat(rawData);
            break;
        case GraphiteDataParser.MULTI_LINE_TYPE:
            this.processMultilineFormat(rawData);
            break;
    }

}

/**
 * get a list of data that has not been read
 * @return {array<array<integer>>}
 */
GraphiteDataParser.prototype.showNewData = function() {
    tempList = this.dataStorage.slice(this.currentDisplayedIndex);
    this.currentDisplayedIndex = this.dataStorage.length;
    return tempList;
}

/**
 * get all data that is stored in the parser in a nested array
 * @return {array<array<number>>}
 */
GraphiteDataParser.prototype.showAllData = function() {
    return this.dataStorage;
}

/**
 * get number of data types,which determines number of lines on the linear graph
 * @return {number}
 */
GraphiteDataParser.prototype.getdataNumber = function() {
    return this.dataNumber || 1;
}

/**
 * 'unnest' a nested array
 * @param {array<array<number>>}
 * @return {array<number>}
 */
function flatten(list) {
    return [].concat.apply([], list);
}