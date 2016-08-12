namespace DAQViewUtility {

    export function forEachOwnObjectProperty(object : any, callback : (property : any) => any) {
        for (let property in object) {
            if (object.hasOwnProperty(property)) {
                callback(property);
            }
        }
    }

    function isPrimitiveType(type: string) {
        return (type === 'string' || type === 'number' || type === 'boolean');
    }

    export function areEqualShallow(a: DAQAggregator.Snapshot.SnapshotElement, b: DAQAggregator.Snapshot.SnapshotElement) {
        if (a['@id'] !== b['@id']) return false;

        for (let key in a) {
            if (a.hasOwnProperty(key)) {
                let value: any = a[key];
                let valueType: string = typeof(value);
                if (value === null || isPrimitiveType(valueType)) {
                    if (value !== b[key]) return false;
                }
            }
        }

        return true;
    }

}