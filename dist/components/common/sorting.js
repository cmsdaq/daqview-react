"use strict";
/**
 * @author Philipp Brummer
 */
var DAQView;
(function (DAQView) {
    var Sorting = (function () {
        function Sorting(value, imagePath) {
            this.value = value;
            this.imagePath = imagePath;
        }
        Sorting.prototype.toString = function () {
            return this.value;
        };
        Sorting.prototype.getImagePath = function () {
            return this.imagePath;
        };
        Sorting.None = new Sorting('None', 'unsorted.png');
        Sorting.Ascending = new Sorting('Ascending', 'sort_asc.png');
        Sorting.Descending = new Sorting('Descending', 'sort_desc.png');
        return Sorting;
    }());
    DAQView.Sorting = Sorting;
})(DAQView || (DAQView = {}));
