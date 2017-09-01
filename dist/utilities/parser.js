"use strict";
/**
 * @author Michail Vougioukas
 */
var DAQAggregator;
(function (DAQAggregator) {
    var SnapshotParser = (function () {
        function SnapshotParser() {
            this.big_map = {};
            this.level = 1;
            this.replacerRecursions = 0;
            this.snapshot = {};
        }
        SnapshotParser.prototype.parse = function (snapshot) {
            this.replacerRecursions = 0;
            this.big_map = {}; //flush old objects
            this.snapshot = snapshot;
            this.explore(this.snapshot);
            for (var key in this.big_map) {
                this.scanAndReplace(this.big_map[key]);
            }
            console.log("Size of map of objects after parsing: " + Object.keys(this.big_map).length);
            console.log("Replacer calls: " + this.replacerRecursions);
            if (this.replacerRecursions > 25000) {
                console.log("Too much recursion imminent...parser aborted proactively");
                return null;
            }
            return new DAQAggregator.Snapshot(this.big_map['DAQ']);
        };
        SnapshotParser.getFieldType = function (field) {
            var ret = typeof field;
            if ((ret == 'object') && (field instanceof Array)) {
                ret = 'array';
            }
            if (field === null) {
                ret = 'null';
            }
            return ret;
        };
        SnapshotParser.prototype.explore = function (obj) {
            for (var key in obj) {
                var elem = obj[key];
                //stores all objects with an @id attribute
                if ((key == "@id")) {
                    this.big_map[elem] = obj;
                }
                var elemTypeLiteral = SnapshotParser.getFieldType(elem);
                var objTypeLiteral = SnapshotParser.getFieldType(obj);
                var doPrependArrayName = false;
                if (elemTypeLiteral == 'array') {
                    if ((elem.length > 0) && (SnapshotParser.getFieldType(elem[0]) == 'object') && elem[0].hasOwnProperty("@id")) {
                        doPrependArrayName = true;
                    }
                }
                if (typeof elem === "object") {
                    this.level++; //will pass to child
                    if (this.level <= 3) {
                        this.explore(elem);
                    }
                    //upon return from an object (so that its definition has already been stored), if it has @id field, replace its definition with a reference to its @id, at parent
                    if (elemTypeLiteral != 'null') {
                        if (elem.hasOwnProperty("@id")) {
                            if (objTypeLiteral == 'object') {
                                obj["ref_" + key] = elem["@id"];
                                delete obj[key];
                            }
                            else {
                                obj[key] = elem["@id"];
                            }
                        }
                    }
                    if (doPrependArrayName) {
                        obj["ref_" + key] = elem;
                        delete obj[key];
                    }
                    this.level--; //will pass to father
                }
            }
        };
        SnapshotParser.prototype.scanAndReplace = function (obj) {
            this.replacerRecursions++;
            /*this allows for a snapshot with up to 5 times more elements than the typical snapshot in late 2016,
             if this is reached, then probably there is something wrong with the snapshot, causing infinite recursion over elements...
             */
            if (this.replacerRecursions > 25000) {
                return;
            }
            for (var key in obj) {
                var elem = obj[key]; // `obj[key]` is the value
                var elemTypeLiteral = SnapshotParser.getFieldType(elem);
                //further explore objects or arrays with recursion
                //will check if contains reference ids and will replace them with actual object references upon return
                var replaceContent = false;
                if (key.indexOf('ref') > -1) {
                    replaceContent = true;
                }
                if (typeof elem === "object") {
                    this.scanAndReplace(elem); // call recursively
                }
                if (replaceContent) {
                    //array of references, object of values which are references, single field reference
                    if (elemTypeLiteral == 'array') {
                        var arr = [];
                        var elemArray = elem;
                        for (var idx = 0; idx < elemArray.length; idx++) {
                            arr[idx] = this.big_map[elemArray[idx]];
                        }
                        obj[key] = arr;
                    }
                    else if (elemTypeLiteral == 'object') {
                        var o = {};
                        for (var pName in elem) {
                            if (elem.hasOwnProperty(pName)) {
                                o[pName] = this.big_map[elem[pName]];
                            }
                        }
                        obj[key] = o;
                    }
                    else if ((elemTypeLiteral == 'number') || (elemTypeLiteral == 'string')) {
                        obj[key] = this.big_map[elem];
                    }
                    obj[key.substring(4)] = obj[key];
                    delete (obj[key]);
                }
            }
        };
        return SnapshotParser;
    }());
    DAQAggregator.SnapshotParser = SnapshotParser;
    var RUWarnMessageAggregator = (function () {
        function RUWarnMessageAggregator() {
        }
        RUWarnMessageAggregator.prototype.resolveRUWarnings = function (snapshot) {
            //retrieve and assign warning messages to RUs
            var rus = snapshot.getDAQ().rus;
            for (var idx = 0; idx < rus.length; idx++) {
                rus[idx].fedsWithErrors = this.getFedWithErrorsForRU(rus[idx]);
            }
            return snapshot;
        };
        //returns FED for this RU (excluding pseudofeds), by expectedId, if they contain error or withoutFragments warning
        RUWarnMessageAggregator.prototype.getFedWithErrorsForRU = function (ru) {
            //fed: warnings
            var fedsWithErrors = [];
            //iterate all messages from feds
            var fedBuilder = ru.fedBuilder;
            for (var _i = 0, _a = fedBuilder.subFedbuilders; _i < _a.length; _i++) {
                var subFEDBuilder = _a[_i];
                for (var _b = 0, _c = subFEDBuilder.frls; _b < _c.length; _b++) {
                    var frl = _c[_b];
                    var feds = frl.feds;
                    for (var fedSlot in feds) {
                        var fed = feds[fedSlot];
                        if (fed.ruFedWithoutFragments || fed.ruFedInError) {
                            fedsWithErrors.push(fed); //fed indexed by its expectedSrcId
                        }
                    }
                }
            }
            return fedsWithErrors;
        };
        return RUWarnMessageAggregator;
    }());
    DAQAggregator.RUWarnMessageAggregator = RUWarnMessageAggregator;
    var RUMaskedCounter = (function () {
        function RUMaskedCounter() {
        }
        RUMaskedCounter.prototype.countMaskedRUs = function (snapshot) {
            //retrieve and assign warning messages to RUs
            var rus = snapshot.getDAQ().rus;
            var rusMasked = 0;
            for (var idx = 0; idx < rus.length; idx++) {
                if (rus[idx].masked) {
                    rusMasked++;
                }
            }
            snapshot.getDAQ().fedBuilderSummary.rusMasked = rusMasked;
            //console.log(rusMasked);
            return snapshot;
        };
        return RUMaskedCounter;
    }());
    DAQAggregator.RUMaskedCounter = RUMaskedCounter;
    var BUNoRateCounter = (function () {
        function BUNoRateCounter() {
        }
        BUNoRateCounter.prototype.countNoRateBUs = function (snapshot) {
            //retrieve and assign warning messages to RUs
            var bus = snapshot.getDAQ().bus;
            var busNoRate = 0;
            for (var idx = 0; idx < bus.length; idx++) {
                if (bus[idx].rate == 0) {
                    busNoRate++;
                }
            }
            snapshot.getDAQ().buSummary.busNoRate = busNoRate;
            return snapshot;
        };
        return BUNoRateCounter;
    }());
    DAQAggregator.BUNoRateCounter = BUNoRateCounter;
})(DAQAggregator || (DAQAggregator = {}));
