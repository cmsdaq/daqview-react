var DAQViewGUIUtility;
(function (DAQViewGUIUtility) {
    function getParametersFromCurrentRequestURL() {
        return getParametersFromURL(document.location.search);
    }
    DAQViewGUIUtility.getParametersFromCurrentRequestURL = getParametersFromCurrentRequestURL;
    function getParametersFromURL(url) {
        var queryString = url.split('+').join(' ');
        var parameters = {};
        var re = /[?&]?([^=]+)=([^&]*)/g;
        var tokens;
        while (tokens = re.exec(queryString)) {
            parameters[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }
        return parameters;
    }
    DAQViewGUIUtility.getParametersFromURL = getParametersFromURL;
})(DAQViewGUIUtility || (DAQViewGUIUtility = {}));
