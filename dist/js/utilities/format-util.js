"use strict";
/**
 * @author Philipp Brummer
 */
var FormatUtility;
(function (FormatUtility) {
    const KILO = 1E3;
    const MEGA = 1E6;
    const GIGA = 1E9;
    const TERA = 1E12;
    function formatSINumber(number, fractionDigits = 1) {
        let result;
        let suffix = '';
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
        let baseStyle = format.baseStyle;
        let style = '';
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
        let classes;
        if (style !== '') {
            classes = classNames(baseStyle, style);
        }
        else {
            classes = baseStyle;
        }
        return classes;
    }
    FormatUtility.getClassNameForNumber = getClassNameForNumber;
    function toFixedNumber(number, fractionDigits, base = 10) {
        let factor = Math.pow(base, fractionDigits);
        return Math.round(number * factor) / factor;
    }
    FormatUtility.toFixedNumber = toFixedNumber;
})(FormatUtility || (FormatUtility = {}));
