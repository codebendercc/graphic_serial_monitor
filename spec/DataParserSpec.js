describe("DataParser", function() {
    var parser;

    beforeEach(function() {
        parser = new GraphiteDataParser();
    });

    describe("when each segment of data is complete ", function() {
        it("should be able to handle normal multiple line data", function() {
            parser.addRawData("1 2.2 \n")
            parser.addRawData("3 4.2 \n")
            expect(parser.showNewData()).toEqual([
                [1, 2.2],
                [3, 4.2]
            ]);
            expect(parser.dataNumber).toEqual(2);
        });

        it("should be able to handle normal multiple line data (containing segments without data)", function() {
            parser.addRawData("1 2.2 \n");
            parser.addRawData("i am dummy line");
            parser.addRawData("3 4.2 \n");
            expect(parser.showNewData()).toEqual([
                [1, 2.2],
                [3, 4.2]
            ]);
            expect(parser.dataNumber).toEqual(2);
        });

        it("should be able to one-liner data on a stream", function() {
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

        it("should be able to one-liner data on a stream", function() {
            parser.addRawData("1\n2\n3\n")
            expect(parser.showNewData()).toEqual([
                [1],
                [2],
                [3]
            ]);
            expect(parser.dataNumber).toEqual(1);
        });

    });


    describe("when segments of data is incomplete (key data is broken down into different segments) ", function() {
        it("float number is broken down (decimal point at the first segement)", function() {
            parser.addRawData("1 2.")
            parser.addRawData("2\n3 4.")
            parser.addRawData("2 \n")
            expect(parser.showNewData()).toEqual([
                [1, 2.2],
                [3, 4.2]
            ]);
            expect(parser.dataNumber).toEqual(2);
        });

        it("float number is broken down (decimal point at the second segement)", function() {
            parser.addRawData("1 2")
            parser.addRawData(".2\n3 4")
            parser.addRawData(".2 \n")
            expect(parser.showNewData()).toEqual([
                [1, 2.2],
                [3, 4.2]
            ]);
            expect(parser.dataNumber).toEqual(2);
        });

        it("float number is broken down (integer part is broken down)", function() {
            parser.addRawData("1 2")
            parser.addRawData("2.2\n3 4")
            parser.addRawData("4.2 \n")
            expect(parser.showNewData()).toEqual([
                [1, 22.2],
                [3, 44.2]
            ]);
            expect(parser.dataNumber).toEqual(2);
        });

        it("float number is broken down (decimal part is broken down)", function() {
            parser.addRawData("1 2.2")
            parser.addRawData("2\n3 4.4")
            parser.addRawData("2 \n")
            expect(parser.showNewData()).toEqual([
                [1, 2.22],
                [3, 4.42]
            ]);
            expect(parser.dataNumber).toEqual(2);
        });

        it("float number is broken down (only negative sign is at the first segment)", function() {
            parser.addRawData("1 -")
            parser.addRawData("2.2\n -")
            parser.addRawData("3 4.2 \n")
            expect(parser.showNewData()).toEqual([
                [1, -2.2],
                [-3, 4.2]
            ]);
            expect(parser.dataNumber).toEqual(2);
        });

        it("should be able to handle irregular multiple line data without incomplete segment", function() {
            parser.addRawData("1 2.2 \n")
            parser.addRawData("3 4.2 \n")
            expect(parser.showNewData()).toEqual([
                [1, 2.2],
                [3, 4.2]
            ]);
            expect(parser.dataNumber).toEqual(2);
        });

        it("should be able to handle incomplete data that crosses multiple lines", function() {
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
});