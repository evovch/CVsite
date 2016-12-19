var gl;
var squareVerticesBuffer;
var squareVerticesColorBuffer;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var vertexColorAttribute;
var perspectiveMatrix;

// ------------------------------------------------------------------------------------------------------------------------------------------------

// Thx http://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
function resizeCanvas(p_gl)
{
    // Get the canvas from the WebGL context
    var v_canvas = p_gl.canvas;

    // Lookup the size the browser is displaying the canvas
    var displayWidth  = v_canvas.clientWidth;
    var displayHeight = v_canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (v_canvas.width != displayWidth || v_canvas.height != displayHeight) {
        // Make the canvas the same size
        v_canvas.width  = displayWidth;
        v_canvas.height = displayHeight;

        // Set the viewport to match
        p_gl.viewport(0, 0, v_canvas.width, v_canvas.height);
    }
}

// ------------------------------------------------------------------------------------------------------------------------------------------------
// Thx https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL
// ------------------------------------------------------------------------------------------------------------------------------------------------

function start()
{
    var canvas = document.getElementById("glcanvas");

    initWebGL(canvas);

    if (gl) {
        resizeCanvas(gl);
        gl.clearColor(0.0, 0.0, 0.2, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

        initShaders();
        initBuffers();

        setInterval(drawScene, 15);
    }
}

// ------------------------------------------------------------------------------------------------------------------------------------------------

function initWebGL(p_canvas)
{
    gl = null;

    try {
        gl = p_canvas.getContext("webgl") || p_canvas.getContext("experimental-webgl");
    }
    catch(e) {}

    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
}

// ------------------------------------------------------------------------------------------------------------------------------------------------

function initBuffers()
{
    var vertices = [
        0.5,  0.5,  0.0,
        -0.5, 0.5,  0.0,
        0.5,  -0.5, 0.0,
        -0.5, -0.5, 0.0
    ];

    squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


	var colors = [
		1.0,  1.0,  1.0,  1.0,    // white
		1.0,  0.0,  0.0,  1.0,    // red
		0.0,  1.0,  0.0,  1.0,    // green
		0.0,  0.0,  1.0,  1.0     // blue
	];

	squareVerticesColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
}

// ------------------------------------------------------------------------------------------------------------------------------------------------

function drawScene()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Lookup the size the browser is displaying the canvas
    var displayWidth  = gl.canvas.clientWidth;
    var displayHeight = gl.canvas.clientHeight;

    perspectiveMatrix = makePerspective(45, displayWidth/displayHeight, 0.1, 100.0);

    loadIdentity();
    mvTranslate([-0.0, 0.0, -6.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
	gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// ------------------------------------------------------------------------------------------------------------------------------------------------

function initShaders()
{
    var vertexShader = getShader("shader-vs");
    var fragmentShader = getShader("shader-fs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

	vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
 	gl.enableVertexAttribArray(vertexColorAttribute);
}

// ------------------------------------------------------------------------------------------------------------------------------------------------

function getShader(id)
{
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var theSource = "";

    var currentChild = shaderScript.firstChild;
    while(currentChild) {
        if (currentChild.nodeType == currentChild.TEXT_NODE) {
            theSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, theSource);
    gl.compileShader(shader);  

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));  
        return null;  
    }

    return shader;
}

// ------------------------------------------------------------------------------------------------------------------------------------------------

//
// Matrix utility functions
//

function loadIdentity() {
    mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
    mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
    multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}
