/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

namespace DAQViewGUIUtility {

    export function getParametersFromCurrentRequestURL(): {[key: string]: string} {
        return parseURLParameters(document.location.search);
    }

    export function parseURLParameters(urlParameters: string): {[key: string]: string} {
        let queryString: string = urlParameters.split('+').join(' ');

        let parameters: {[key: string]: string} = {};
        let re: RegExp = /[?&]?([^=]+)=([^&]*)/g;

        let tokens: RegExpExecArray;
        while (tokens = re.exec(queryString)) {
            parameters[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return parameters;
    }

}