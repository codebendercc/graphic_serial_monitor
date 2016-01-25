/*
parse raw string data and store it into processable nested arrays
*/
GraphiteDataParser = function() {
    ////////////////////
    //INSTANCE VARIABLE/
    ////////////////////
    /*VARIABLE NAME: dataStorage
      PURPOSE      : store all processed data
      FORMAT       : 2D-array of integers 
                     [[set of simultanous data],[..],[..]...]
    */
    this.dataStorage = [];
    /*VARIABLE NAME: dataFormat
      PURPOSE      : format of data 
      FORMAT       : integer
      COMMENT      : please use the constants provided instead of integer
    */
    this.dataFormat = GraphiteDataParser.ONE_LINER_TYPE;
    /*VARIABLE NAME: currentDisplayedIndex
      PURPOSE      : the index of the last number 'displayed' using method showNewData()
      FORMAT       : integer
    */
    this.currentDisplayedIndex = 0;
    /*VARIABLE NAME: pendingData
      PURPOSE      : 1-D array of values scraped from raw data that is not ready to put into storage
      FORMAT       : integer array
    */
    this.pendingData = [];
    /*VARIABLE NAME: dataNumber
      PURPOSE      : number of data types/ number of lines on the linear graph 
      FORMAT       : integer
    */
    this.dataNumber = 1;
    /*VARIABLE NAME: withXCord
      PURPOSE      : if there are more the one data type, this indicates whether the first of the data is used as the x-coordinate
      FORMAT       : boolean
    */
    this.withXCord = true;
    /*VARIABLE NAME: incompleteNumberSegment
      PURPOSE      : if there is a (possibly) incomplete data segement from the previous raw data stream, it will be stored here, 
                     for example: "xxxxxx 1.2" or "xxxxx 1."
      FORMAT       : String
    */
    this.incompleteNumberSegment = null;

    /////////////////////
    //PROTECTED METHODS//
    /////////////////////

    this.processOneLinerFormat = function(rawData) {
        if (this.incompleteNumberSegment != null) {
            rawData = this.incompleteNumberSegment + rawData;
            this.incompleteNumberSegment = null;
        }
        if (rawData.indexOf("\n") > -1) { //if the raw data consists of more than one line, it's not one-liner format
            this.dataFormat = GraphiteDataParser.MULTI_LINE_TYPE;
            this.currentDisplayedIndex = 0;
            this.pendingData = flatten(this.dataStorage); //put all the current data as pending, (processed as the single-data-type format)
            this.dataStorage = [];
            this.processMultilineFormat(rawData);
            return;
        }

        scanner = new StringScanner(rawData);
        var value;
        while (value = scanner.nextFloat()) {
            if (this.checkAndProcessIncompleteSegment(scanner, value)) {
                break;
            }
            this.dataStorage.push([value]);
        }
        this.checkNegativeSignEnding(scanner);
    }

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
                }
                continue;
            }

            if (this.checkAndProcessIncompleteSegment(scanner, value)) {
                break;
            }

            this.pendingData.push(value);
        }
        this.checkNegativeSignEnding(scanner);
    }

    this.checkNegativeSignEnding = function(scanner){
    	if (scanner.last() == '-'){
    		this.incompleteNumberSegment = '-';
    	}
    }

    //check whether the current data stream has reached end and it ends with (potentially) incomplete data
    //if has incomplete data, put it in incompleteSegment and return true
    //else return false

    this.checkAndProcessIncompleteSegment = function(scanner, value) {
        if (scanner.reachedEnd()) {
            this.incompleteNumberSegment = value + '';
            return true;
        }
        if (scanner.reachedEnd(scanner.cur + 1) && scanner.current() == '.') {
            this.incompleteNumberSegment = value + '.';
            return true;
        }
        return false;
    }

    //check whether the first data in the line is strictly incremental
    //only check the last two because we are doing this check for every new line
    this.hasIncrementalX = function() {
        if (this.dataStorage.length <= 1) { //there is only one or no line
            return true;
        }
        return (this.dataStorage[this.dataStorage.length - 1][0] > this.dataStorage[this.dataStorage.length - 2][0]);
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
GraphiteDataParser.MULTI_DATA_WITH_X = 2;
/*MULTI_DATA_WITH_X example:
temperature: 2 pressure: 31
temperature: 5 pressure: 11
temperature: 6 pressure: 23
temperature: 2 pressure: 23
temperature: 4 pressure: 43
*/



GraphiteDataParser.prototype.addRawData = function(rawData) {
    console.log(rawData);
    switch (this.dataFormat) {
        case GraphiteDataParser.ONE_LINER_TYPE:
            this.processOneLinerFormat(rawData);
            break;
        case GraphiteDataParser.MULTI_LINE_TYPE:
            this.processMultilineFormat(rawData);
            break;
        case GraphiteDataParser.MULTI_DATA_WITH_X:
            this.processMultiDataWithXFormat(rawData);
            break;
        default:
            throw "how did even reach here"
    }

}
//return a list of data, starting from the currentDisplayedIndex to end
GraphiteDataParser.prototype.showNewData = function() {
    tempList = this.dataStorage.slice(this.currentDisplayedIndex);
    this.currentDisplayedIndex = this.dataStorage.length;
    return tempList;
}

GraphiteDataParser.prototype.showAllData = function() {
    return this.dataStorage;
}

GraphiteDataParser.prototype.getdataNumber = function() {
    return this.dataNumber || 1;
}

function contains_number(line) {
    scanner = new StringScanner(line);
    return !(scanner.nextFloat() == null);
}

function flatten(list) {
    return [].concat.apply([], list);
}