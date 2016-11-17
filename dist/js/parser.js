var tic = new Date();
console.log('Starting at '+tic.toISOString()+'\n');

//globals
var apiCallDuration;
var level = 1;
var max_level = 1;
var count_f = 0; //counts all fields
var count_o = 0; //counts further explorable fields, less (or equal) than count_f
var count_id = 0;
var max_id = 1;
var big_map = {};//index of all object definitions discovered
var maxRecursionDepth = 3;

function explore(obj) {
    for(var key in obj) { // iterate, `key` is the property key
        var elem = obj[key]; // `obj[key]` is the value

        // print (treeLevelPrefix()+' '+key+' ('+getFieldType(elem)+')');  //this will print the whole snapshot tree!
        count_f++;

        //stores all objects with an @id attribute
        if ((key == "@id")){
            count_id++;
            big_map[elem] = obj;

            if (elem>max_id){
                max_id = elem;
            }
        }

        var elemTypeLiteral = getFieldType(elem);
        var objTypeLiteral = getFieldType(obj);

        //further explore objects or arrays with recursion

        //if the element is an array and it contains object definition(s), we assume these are going to be replaced by ids down in the recursion
        //therefore the field name pointing to this array, must be prepended with 'ref_' upon return of recursion at the same level
        //assumption: the array to rename contains at least one object definition and this is at index 0 (if object definitions are all that is contained, this is well covered)
        //assumption on the renamed array: prepending 'ref_' means that in later passes, all contents of this array will be treated as references
        var doPrependArrayName = false;
        if (elemTypeLiteral == 'array'){
            if ((elem.length>0)&&(getFieldType(elem[0])=='object')&&elem[0].hasOwnProperty("@id")){
                doPrependArrayName = true;
            }
        }

        if (typeof elem === "object"){
            count_o++;
            level++; //will pass to child
            if (level>max_level){
                max_level = level;
            }
            
            if (level<=maxRecursionDepth){
                explore(elem);
            }

            //upon return from an object (so that its definition has already been stored), if it has @id field, replace its definition with a reference to its @id, at parent
            if (elemTypeLiteral != 'null'){
                if (elem.hasOwnProperty("@id")){
                    if (objTypeLiteral == 'object'){  //non array object
                        obj["ref_"+key] = elem["@id"];
                        delete obj[key];
                    }else{
                        obj[key] = elem["@id"];
                    }
                }
            }

            if (doPrependArrayName){
                obj["ref_"+key] = elem;
                delete obj[key];
            }

            level--; //will pass to father
        }
    }
}

function scanAndReplace(obj) {

    for(var key in obj) { // iterate, `key` is the property key
        var elem = obj[key]; // `obj[key]` is the value


        var elemTypeLiteral = getFieldType(elem);

        //further explore objects or arrays with recursion

        //will check if contains reference ids and will replace them with actual object references upon return
        var replaceContent = false;
        if (key.indexOf('ref')>-1){
            replaceContent = true;
        }

        if (typeof elem === "object"){
            scanAndReplace(elem); // call recursively
        }

        if (replaceContent){
            //array of references, object of values which are references, single field reference

            if (elemTypeLiteral == 'array'){
                var arr = [];
                for (var idx in elem){
                    arr[idx] = big_map[elem[idx]];
                }
                obj[key] = arr;
            }else if (elemTypeLiteral == 'object'){
                var o = {};
                for (var pName in elem){
                    o[pName] = big_map[elem[pName]];
                }
                obj[key] = o;
            }else if ((elemTypeLiteral == 'number') || (elemTypeLiteral == 'string')){
                obj[key] = big_map[elem];

            }

            obj[key.substring(4)] = obj[key];
            delete(obj[key]);
        }
    }
}

function httpGet(endpoint, cb){
    var ticApi = new Date();

    //async GET to use with browser env
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            apiCallDuration = new Date().getTime()-ticApi.getTime();
        cb(xmlHttp.responseText);
    }
    xmlHttp.open("GET", endpoint, true); // true for asynchronous
    xmlHttp.send(null);

}

function APIcallback(res){
    //print('--------------------------------\n'+res)
    console.log('Object returned as string of length='+res.length+'\n');
    res = JSON.parse(res); //format string response to local JSON

    //first full scan of snapshot, to identify and index object definitions
    explore(res); //recursive/dfs parsing of snapshot

    console.log('\n---------------------\nFields discovered in snapshot:'+count_f+' of which point to objects: '+count_o+'\nMax tree level reached: '+max_level);

    for (var key in big_map){
        scanAndReplace(big_map[key]);
    }

    console.log('End of API call+parsing+indexing, took '+(new Date().getTime()-tic.getTime())+' ms, of which '+apiCallDuration+' for the API call and response');
}


var funct_main = function(){
    var endpoint = 'http://dev-daq-expert.cern.ch/snapshot?time=%222016-06-21T14:25:25.185Z%22';
    var url_splitted = endpoint.split('?');
    console.log('calling endpoint: '+url_splitted[0]+' with params: '+url_splitted[1]);

    var request = $.getJSON(endpoint);
    request.done(function(res) {
        console.log(res);
        //first full scan of snapshot, to identify and index object definitions
        explore(res); //recursive/dfs parsing of snapshot

        console.log('\n---------------------\nFields discovered in snapshot:'+count_f+' of which point to objects: '+count_o+'\nMax tree level reached: '+max_level);

        for (var key in big_map){
            scanAndReplace(big_map[key]);
        }

        console.log(big_map['1'])
    });
    request.fail(function(error) {
        console.log(error);
    });

    //httpGet(endpoint,APIcallback); //second arg is callback to be used in case of async

}

//number
//array
//string
//boolean
//object (object which is not array)
function getFieldType(field){
    var ret = typeof field;
    if ((ret == 'object')&&(field instanceof Array)){
        ret = 'array';
    }
    if (field === null){
        ret = 'null';
    }
    return ret;
}

//funct_main(); //program start

// console.log('End of API call+parsing+indexing, took '+(new Date().getTime()-tic.getTime())+' ms, of which '+apiCallDuration+' for the API call and response');

var parseSnapshot = function parseSnapshot(snapshotJSON) {
    //console.log(snapshotJSON);
    explore(snapshotJSON);
    //console.log(big_map);

    for (var key in big_map){
        scanAndReplace(big_map[key]);
    }

    //console.log(big_map);
    return big_map['1'];
};