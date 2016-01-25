describe("DataParser", function() {
    var parser;
    it("should be able to handle normal multiple line data", function() {
        parser = new GraphiteDataParser();
        parser.addRawData("1 2.2 \n")
        parser.addRawData("3 4.2 \n")
        expect(parser.showNewData()).toEqual([
            [1, 2.2],
            [3, 4.2]
        ]);
        expect(parser.dataNumber).toEqual(2);
    });

    it("should be able to one-liner data on a stream", function() {
        parser = new GraphiteDataParser();
        parser.addRawData("1 2.2 3 4.2 ")
        parser.addRawData("1 2 3 4 5 ")
        expect(parser.showNewData()).toEqual([
            [1],
            [2.2],
            [3],
            [4.2],
            [1],
            [2],
            [3],
            [4],
            [5]
        ]);
        expect(parser.dataNumber).toEqual(1);
    });

    it("should be able to handle irregular multiple line data with incomplete segment", function() {
        parser = new GraphiteDataParser();
        parser.addRawData("1 2.")
        parser.addRawData("2\n3 4.")
        parser.addRawData("2 \n")
        expect(parser.showNewData()).toEqual([
            [1, 2.2],
            [3, 4.2]
        ]);
        expect(parser.dataNumber).toEqual(2);
    });

    it("should be able to handle irregular multiple line data with incomplete segment containing negtive number", function() {
        parser = new GraphiteDataParser();
        parser.addRawData("1 2.")
        parser.addRawData("2\n3 -")
        parser.addRawData("2 \n")
        expect(parser.showNewData()).toEqual([
            [1, 2.2],
            [3, -2]
        ]);
        expect(parser.dataNumber).toEqual(2);
    });

     it("should be able to handle irregular multiple line data without incomplete segment", function() {
        parser = new GraphiteDataParser();
        parser.addRawData("1 2.2 \n")
        parser.addRawData("3 4.2 \n")
        expect(parser.showNewData()).toEqual([
            [1, 2.2],
            [3, 4.2]
        ]);
        expect(parser.dataNumber).toEqual(2);
    });

    it("should be able to handle incomplete data that crosses multiple lines", function() {
        parser = new GraphiteDataParser();
        parser.addRawData("2")
        parser.addRawData("3")
        parser.addRawData("4")
        parser.addRawData(" 2 ")
        expect(parser.showNewData()).toEqual([
            [234],
            [2]
        ]);
        expect(parser.dataNumber).toEqual(1);
    });

});