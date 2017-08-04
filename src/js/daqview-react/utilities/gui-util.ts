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

    /**
     * Script for generating links to share expert browser view
     */

    let sharableLink:string = null;

    export function getSharableLink(): string {
        console.log("Getting sharable link " + sharableLink)
        return sharableLink
    }

    export function setSharableLink(url:string){
        sharableLink = url
    }
}