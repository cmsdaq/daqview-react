namespace DAQView {
    export interface SortFunction {
        presort?: (snapshot: DAQAggregator.Snapshot) => DAQAggregator.Snapshot;
        sort: (snapshot: DAQAggregator.Snapshot) => DAQAggregator.Snapshot;
    }

    export class Sorting {
        private value: string;
        private imagePath: string;

        constructor(value: string, imagePath: string) {
            this.value = value;
            this.imagePath = imagePath;
        }

        toString() {
            return this.value;
        }

        getImagePath() {
            return this.imagePath;
        }

        static None = new Sorting('None', 'unsorted.png');
        static Ascending = new Sorting('Ascending', 'sort_asc.png');
        static Descending = new Sorting('Descending', 'sort_desc.png');
    }
}