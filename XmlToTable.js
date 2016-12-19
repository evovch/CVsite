// Build a table from an input XML file
function XmlToTable(xml) {
    var xmlDoc = xml.responseXML;
    var publItems = xmlDoc.documentElement.childNodes;

    var resultTableHtml = "<table border=1>";

    // Table header
    resultTableHtml += "<tr>"
    resultTableHtml += "<td><b>ID</b></td>"
    resultTableHtml += "<td><b>DOI</b></td>"
    resultTableHtml += "<td><b>Name</b></td>"
    resultTableHtml += "<td><b>Journal</b></td>"
    resultTableHtml += "<td><b>Full author list</b></td>"
    resultTableHtml += "<td><b>Contribution</b></td>"
    resultTableHtml += "<td><b>Links</b></td>"
    resultTableHtml += "</tr>";

    // Counter of the publications
    var publID = 0;

    // Loop over the papers
    for (var i=0; i<publItems.length; i++) {
        if (publItems[i].nodeType == 1) {

            // Each next <item> tag is a new line in the table
            resultTableHtml += "<tr>";

            publID++;
            resultTableHtml += "<td><b>" + publID + "</b></td>";
            var paperParams = ["", "", "", "", "", ""];

            // Children of an <item> tag - paper parameters - doi, name, journal, authors, contribution, links.
            var itemChildren = publItems[i].childNodes;

            // Loop over the paper parameters and store them in the array
            for (var j=0; j<itemChildren.length; j++) {
                if (itemChildren[j].nodeType == 1) {

                    // Allow empty tags in the input XML file
                    if (itemChildren[j].childNodes.length > 0) { 

                        switch (itemChildren[j].nodeName) {
                            case "doi":
                                paperParams[0] = itemChildren[j].firstChild.nodeValue;
                                break;
                            case "name":
                                paperParams[1] = itemChildren[j].firstChild.nodeValue;
                                break;
                            case "journal":
                                paperParams[2] = itemChildren[j].firstChild.nodeValue;
                                break;
                            case "authors":
                                paperParams[3] = itemChildren[j].firstChild.nodeValue;
                                break;
                            case "contribution":
                                paperParams[4] = itemChildren[j].firstChild.nodeValue;
                                break;
                            case "links":
                                var linksNode = itemChildren[j];
                                if (linksNode.childNodes.length > 0) {
                                    paperParams[5] += "<table>";
                                    // Loop over the links
                                    for (var k=0; k<linksNode.childNodes.length; k++) {
                                        var linkNode = linksNode.childNodes[k];
                                        if (linkNode.nodeType == 1) {
                                            paperParams[5] += "<tr><td><a href=\"" + linkNode.firstChild.nodeValue + "\" target=\"_blank\">" + linkNode.getAttribute('site') + "</a></td></tr>";
                                        }
                                    }
                                    paperParams[5] += "</table>";
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
            }

            // Write columns into the table in the correct order
            for (var k=0; k<6; k++) {
                resultTableHtml += "<td>" + paperParams[k] + "</td>";
            }

            // Finalize the line of the table
            resultTableHtml += "</tr>";
        }
    }

    // Finalize the table
    resultTableHtml += "</table>";

    return resultTableHtml;
}
