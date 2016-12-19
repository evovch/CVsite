/* Script for random colors in the left navigation pane */

function mOver(obj) {
    var rndColor = Math.floor(Math.random()*11184810);
    var tmpColor = 15856113 - rndColor;
    var resClor = "#"+tmpColor.toString(16);
    obj.style.backgroundColor = resClor;
}
function mOut(obj) {
    obj.style.backgroundColor = "#F1F1F1";
}