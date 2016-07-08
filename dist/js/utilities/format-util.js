var FormatUtility;
(function (FormatUtility) {
    var KILO = 1E3;
    var MEGA = 1E6;
    var GIGA = 1E9;
    var TERA = 1E12;
    function formatSINumber(number, fractionDigits) {
        if (fractionDigits === void 0) { fractionDigits = 1; }
        var result;
        var suffix = '';
        if (number < KILO) {
            result = number;
        }
        else if (number < MEGA) {
            result = number / KILO;
            suffix = 'k';
        }
        else if (number < GIGA) {
            result = number / MEGA;
            suffix = 'M';
        }
        else if (number < TERA) {
            result = number / GIGA;
            suffix = 'G';
        }
        return toFixedNumber(result, fractionDigits) + suffix;
    }
    FormatUtility.formatSINumber = formatSINumber;
    function getClassNameForNumber(number, format) {
        var baseStyle = format.baseStyle;
        var style = '';
        if (format.formats) {
            format.formats.some(function (format) {
                if (typeof format.min === 'undefined' || number >= format.min) {
                    if (typeof format.max === 'undefined' || number <= format.max) {
                        style = baseStyle + format.styleSuffix;
                        return true;
                    }
                }
            });
        }
        var classes;
        if (style !== '') {
            classes = classNames(baseStyle, style);
        }
        else {
            classes = baseStyle;
        }
        return classes;
    }
    FormatUtility.getClassNameForNumber = getClassNameForNumber;
    function toFixedNumber(number, fractionDigits, base) {
        if (base === void 0) { base = 10; }
        var factor = Math.pow(base, fractionDigits);
        return Math.round(number * factor) / factor;
    }
    FormatUtility.toFixedNumber = toFixedNumber;
})(FormatUtility || (FormatUtility = {}));
//# sourceMappingURL=format-util.js.map