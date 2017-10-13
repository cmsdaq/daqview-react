"use strict";
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
        let queryString = urlParameters.split('+').join(' ');
        let parameters = {};
        let re = /[?&]?([^=]+)=([^&]*)/g;
        let tokens;
        while (tokens = re.exec(queryString)) {
            parameters[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }
        return parameters;
    }
    DAQViewGUIUtility.parseURLParameters = parseURLParameters;
    /**
     * Script for generating links to share expert browser view
     */
    let sharableLink = null;
    function getSharableLink() {
        console.log("Getting sharable link " + sharableLink);
        return sharableLink;
    }
    DAQViewGUIUtility.getSharableLink = getSharableLink;
    function setSharableLink(url) {
        sharableLink = url;
    }
    DAQViewGUIUtility.setSharableLink = setSharableLink;
})(DAQViewGUIUtility || (DAQViewGUIUtility = {}));
