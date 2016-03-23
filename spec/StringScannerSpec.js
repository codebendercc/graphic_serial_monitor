describe("StringScanner", function() {
    var scanner;
    it("can recognise float numbers in an ordinary string", function() {
        scanner = new StringScanner("2.5ok0.9what1.0 1,-1 1.");
        expect(scanner.nextFloat()).toEqual(2.5);
        expect(scanner.nextFloat()).toEqual(0.9);
        expect(scanner.nextFloat()).toEqual(1.0);
        expect(scanner.nextFloat()).toEqual(1);
        expect(scanner.nextFloat()).toEqual(-1);
    });

    it("can return null if there is no float in the string", function() {
        scanner = new StringScanner("there is no string on me..");
        expect(scanner.nextFloat()).toEqual(null);
    })

    it("can handle incomplete negative number", function() {
        scanner = new StringScanner("1.2 -");
        expect(scanner.nextFloat()).toEqual(1.2);
        expect(scanner.nextFloat()).toEqual(null);
        expect(scanner.reachedEnd()).toEqual(true);
    })

    it("can handle incomplete decimal number", function() {
        scanner = new StringScanner("1.2 1.");
        expect(scanner.nextFloat()).toEqual(1.2);
        expect(scanner.nextFloat()).toEqual(1);
    })

    it("stops cursor at delimeter", function() {
        scanner = new StringScanner("1.2\n 2.2\n");
        expect(scanner.nextFloat()).toEqual(1.2);
        expect(scanner.nextFloat()).toEqual(null);
        expect(scanner.nextFloat()).toEqual(2.2);
    })

    it("can stop cursor at first character if it's delimeter", function() {
        scanner = new StringScanner("\n1.2 ");
        expect(scanner.nextFloat()).toEqual(null);
        expect(scanner.nextFloat()).toEqual(1.2);
    })

    it("can detect delimeter if it's the last char", function() {
        scanner = new StringScanner("1.2 \n");
        expect(scanner.nextFloat()).toEqual(1.2);
        expect(scanner.nextFloat()).toEqual(null);
        expect(scanner.data.charAt(scanner.cur - 1)).toEqual("\n");
    })
    
    it("can reset cursor properly", function() {
        scanner = new StringScanner("1a2b3c4d5");
        expect(scanner.nextFloat()).toEqual(1);
        scanner.resetCursor();
        expect(scanner.nextFloat()).toEqual(1);
    })

    it("can get next Character using nextChar() method", function() {
        scanner = new StringScanner("1a");
        expect(scanner.nextFloat()).toEqual(1);
        expect(scanner.nextChar()).toEqual("a");
        expect(scanner.nextChar()).toEqual(null);
    })

    it("can get next string segment before next delimeter using next() method", function() {
        scanner = new StringScanner("1 this thing\n");
        expect(scanner.nextFloat()).toEqual(1);
        expect(scanner.next()).toEqual(" this thing");
        expect(scanner.next()).toEqual(null);
    })

    it("can get the character before the cursor using next() method", function() {
        scanner = new StringScanner("112s123\n");
        expect(scanner.previous()).toEqual(null);
        expect(scanner.nextFloat()).toEqual(112);
        expect(scanner.nextChar()).toEqual("s");
        expect(scanner.previous()).toEqual("s");
    })
});