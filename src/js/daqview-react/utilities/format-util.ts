namespace FormatUtility {

    const KILO: number = 1E3;
    const MEGA: number = 1E6;
    const GIGA: number = 1E9;
    const TERA: number = 1E12;

    export function formatSINumber(number: number, fractionDigits: number = 1): string {
        let result: number;
        let suffix: string = '';
        if (number < KILO) {
            result = number;
        } else if (number < MEGA) {
            result = number / KILO;
            suffix = 'k';
        } else if (number < GIGA) {
            result = number / MEGA;
            suffix = 'M';
        } else if (number < TERA) {
            result = number / GIGA;
            suffix = 'G';
        }
        return toFixedNumber(result, fractionDigits) + suffix;
    }

    export interface NumberFormatRange {
        min?: number;
        max?: number;
        styleSuffix: string;
    }

    export interface NumberFormat {
        baseStyle: string;
        formats?: NumberFormatRange[];
    }

    export function getClassNameForNumber(number: number, format: NumberFormat): string {
        let baseStyle: string = format.baseStyle;
        let style: string = '';

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

        let classes: string;
        if (style !== '') {
            classes = classNames(baseStyle, style);
        } else {
            classes = baseStyle;
        }

        return classes;
    }

    export function toFixedNumber(number: number, fractionDigits: number, base: number = 10): number {
        let factor: number = Math.pow(base, fractionDigits);
        return Math.round(number * factor) / factor;
    }

}