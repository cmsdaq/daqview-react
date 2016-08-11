namespace DAQViewGUIUtility {

    export function getParametersFromCurrentRequestURL(): {[key: string]: string} {
        return getParametersFromURL(document.location.search);
    }

    export function getParametersFromURL(url: string): {[key: string]: string} {
        let queryString: string = url.split('+').join(' ');

        let parameters: {[key: string]: string} = {};
        let re: RegExp = /[?&]?([^=]+)=([^&]*)/g;

        let tokens: RegExpExecArray;
        while (tokens = re.exec(queryString)) {
            parameters[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return parameters;
    }

}