"use strict";
/**
 * @author Philipp Brummer
 */
var DAQView;
(function (DAQView) {
    class Sorting {
        constructor(value, imagePath) {
            this.value = value;
            this.imagePath = imagePath;
        }
        toString() {
            return this.value;
        }
        getImagePath() {
            return this.imagePath;
        }
    }
    Sorting.None = new Sorting('None', 'unsorted.png');
    Sorting.Ascending = new Sorting('Ascending', 'sort_asc.png');
    Sorting.Descending = new Sorting('Descending', 'sort_desc.png');
    DAQView.Sorting = Sorting;
})(DAQView || (DAQView = {}));
