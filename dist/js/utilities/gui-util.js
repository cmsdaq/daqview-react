/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */
var DAQViewGUIUtility;
(function (DAQViewGUIUtility) {
    function getParametersFromCurrentRequestURL() {
        return parseURLParameters(document.location.search);
    }
    DAQViewGUIUtility.getParametersFromCurrentRequestURL = getParametersFromCurrentRequestURL;
    function parseURLParameters(urlParameters) {
        var queryString = urlParameters.split('+').join(' ');
        var parameters = {};
        var re = /[?&]?([^=]+)=([^&]*)/g;
        var tokens;
        while (tokens = re.exec(queryString)) {
            parameters[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }
        return parameters;
    }
    DAQViewGUIUtility.parseURLParameters = parseURLParameters;
})(DAQViewGUIUtility || (DAQViewGUIUtility = {}));
