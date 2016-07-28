namespace DAQAggregator {

    export class SnapshotParser {

        private big_map: {} = {};
        private level: number = 1;

        public parse(snapshot: {}): Snapshot {

            this.explore(snapshot);

            for (var key in this.big_map) {
                this.scanAndReplace(this.big_map[key]);
                
            }
            return new Snapshot(this.big_map['DAQ']);
        }

        getFieldType(field) {
            var ret = typeof field;
            if ((ret == 'object') && (field instanceof Array)) {
                ret = 'array';
            }
            if (field === null) {
                ret = 'null';
            }
            return ret;
        }

        explore(obj: {}): void {
            for (var key in obj) {
                var elem = obj[key];

                //stores all objects with an @id attribute
                if ((key == "@id")) {
                    this.big_map[elem] = obj;

                }

                var elemTypeLiteral = this.getFieldType(elem);
                var objTypeLiteral = this.getFieldType(obj);

                var doPrependArrayName = false;
                if (elemTypeLiteral == 'array') {
                    if ((elem.length > 0) && (this.getFieldType(elem[0]) == 'object') && elem[0].hasOwnProperty("@id")) {
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
                            if (objTypeLiteral == 'object') {  //non array object
                                obj["ref_" + key] = elem["@id"];
                                delete obj[key];
                            } else {
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
        }

        scanAndReplace(obj: {}): void {
            for (var key in obj) { // iterate, `key` is the property key
                var elem = obj[key]; // `obj[key]` is the value


                var elemTypeLiteral = this.getFieldType(elem);

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
                        for (var idx in elem) {
                            arr[idx] = this.big_map[elem[idx]];
                        }
                        obj[key] = arr;
                    } else if (elemTypeLiteral == 'object') {
                        var o = {};
                        for (var pName in elem) {
                            o[pName] = this.big_map[elem[pName]];
                        }
                        obj[key] = o;
                    } else if ((elemTypeLiteral == 'number') || (elemTypeLiteral == 'string')) {
                        obj[key] = this.big_map[elem];

                    }

                    obj[key.substring(4)] = obj[key];
                    delete (obj[key]);
                }
            }
        }


    }
}