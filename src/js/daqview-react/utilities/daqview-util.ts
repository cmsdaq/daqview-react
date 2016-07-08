namespace DAQViewUtility {

    export function forEachOwnObjectProperty(object : any, callback : (property : any) => any) {
        for (let property in object) {
            if (object.hasOwnProperty(property)) {
                callback(property);
            }
        }
    }

}