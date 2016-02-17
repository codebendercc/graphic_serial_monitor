describe("StringScanner", function() {
    var scanner;
    it("should be able to recognise float numbers in an ordinary string", function() {
        scanner = new StringScanner("2.5ok6.9what1.0 1,-1 1.");
        expect(scanner.nextFloat()).toEqual(2.5);
        expect(scanner.nextFloat()).toEqual(6.9);
        expect(scanner.nextFloat()).toEqual(1.0);
        expect(scanner.nextFloat()).toEqual(1);
        expect(scanner.nextFloat()).toEqual(-1);
    });

    it("should be able to return null if there is no float in the string", function() {
        scanner = new StringScanner("there is no string on me..");
        expect(scanner.nextFloat()).toEqual(null);
    })

    it("has no problem with incomplete negative number", function() {
        scanner = new StringScanner("1.2 -");
        expect(scanner.nextFloat()).toEqual(1.2);
        expect(scanner.nextFloat()).toEqual(null);
        expect(scanner.reachedEnd()).toEqual(true);
    })

    it("has no problem with incomplete negative number", function() {
        scanner = new StringScanner("1.2 1.");
        expect(scanner.nextFloat()).toEqual(1.2);
        expect(scanner.nextFloat()).toEqual(1);
        expect(scanner.current()).toEqual('.');
    })

    it("should be stop at delimeter", function() {
        scanner = new StringScanner("1.2\n 2.2\n");
        expect(scanner.nextFloat()).toEqual(1.2);
        console.log(scanner.cur);
        expect(scanner.nextFloat()).toEqual(null);
        expect(scanner.nextFloat()).toEqual(2.2);
    })

    it("should stop at first character if it's delimeter", function() {
        scanner = new StringScanner("\n1.2");
        expect(scanner.nextFloat()).toEqual(null);
        expect(scanner.nextFloat()).toEqual(1.2);
    })

    it("should detect delimeter if it's the last char", function() {
        scanner = new StringScanner("1.2 \n");
        expect(scanner.nextFloat()).toEqual(1.2);
        expect(scanner.nextFloat()).toEqual(null);
        expect(scanner.data.charAt(scanner.cur - 1)).toEqual("\n");
    })
    
    it("reset cursor works properly", function() {
        scanner = new StringScanner("1a2b3c4d5");
        expect(scanner.nextFloat()).toEqual(1);
        scanner.resetCursor();
        expect(scanner.nextFloat()).toEqual(1);
    })

    it("#nextChar", function() {
        scanner = new StringScanner("1a");
        expect(scanner.nextFloat()).toEqual(1);
        expect(scanner.nextChar()).toEqual("a");
        expect(scanner.nextChar()).toEqual(null);
    })

    it("#next", function() {
        scanner = new StringScanner("1 this thing\n");
        expect(scanner.nextFloat()).toEqual(1);
        expect(scanner.next()).toEqual(" this thing");
        expect(scanner.next()).toEqual(null);
    })

    it("#previous", function() {
        scanner = new StringScanner("112s123\n");
        expect(scanner.previous()).toEqual(null);
        expect(scanner.nextFloat()).toEqual(112);
        expect(scanner.nextChar()).toEqual("s");
        expect(scanner.previous()).toEqual("s");
    })
});