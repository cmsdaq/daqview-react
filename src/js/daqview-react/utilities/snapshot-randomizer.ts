namespace DAQAggregator {

    const TYPE_STRING: string = 'string';
    const TYPE_NUMBER: string = 'number';
    const TYPE_OBJECT: string = 'object';

    export function randomizeSnapshot(snapshot: {[key: string]: any}, maxRecursion: number = 10, recursion: number = 0) {
        if (recursion >= maxRecursion) {
            return;
        }
        for (let key in snapshot) {
            if (snapshot.hasOwnProperty(key)) {
                let element: any = snapshot[key];
                let type: string = typeof element;

                if (type === TYPE_STRING) {
                } else if (type === TYPE_NUMBER) {
                    snapshot[key] = FormatUtility.toFixedNumber(Math.random() * 200, 0);
                } else if (type === TYPE_OBJECT) {
                    randomizeSnapshot(snapshot[key], maxRecursion, ++recursion);
                }
            }
        }
    }

}