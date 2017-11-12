const vShader = `
attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor;
uniform vec3 translate;
uniform mat4 scale;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

void main() 
{
    mat4 translateMatrix = mat4(
        1.0, 0.0, 0.0, translate.x,
        0.0, 1.0, 0.0, translate.y,
        0.0, 0.0, 1.0, translate.z,
        0.0, 0.0, 0.0, 1.0
    );

    gl_Position = scale * translateMatrix * vPosition;// * projectionMatrix * modelViewMatrix; 
    fColor = vColor;
} 
`;

const fShader = `
precision mediump float;
varying vec4 fColor;

void main()
{
    gl_FragColor = fColor;
}
`;

function createProgram(gl){
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vShader);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fShader);

    const program = gl.createProgram();
    gl.attachShader( program, vertexShader );
    gl.attachShader( program, fragmentShader );
    gl.linkProgram( program );

    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var msg = "Shader program failed to link.  ERROR: " + gl.getProgramInfoLog( program );
        alert( msg );
        return -1;
    }

    return program;
}

function loadShader(gl, shaderType, source){
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}