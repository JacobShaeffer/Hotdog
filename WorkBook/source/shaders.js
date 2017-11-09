const vShader = `
attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor;
uniform mat4 scale;
uniform vec3 rotation;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

void main() 
{
    // Compute the sines and cosines of theta for each of
    //   the three axes in one computation.
    vec3 angles = radians( rotation );
    vec3 c = cos( angles );
    vec3 s = sin( angles );

    // Remeber: thse matrices are column-major
    mat4 rx = mat4( 1.0,  0.0,  0.0, 0.0,
            0.0,  c.x,  s.x, 0.0,
            0.0, -s.x,  c.x, 0.0,
            0.0,  0.0,  0.0, 1.0 );

    mat4 ry = mat4( c.y, 0.0, -s.y, 0.0,
            0.0, 1.0,  0.0, 0.0,
            s.y, 0.0,  c.y, 0.0,
            0.0, 0.0,  0.0, 1.0 );


    mat4 rz = mat4( c.z, -s.z, 0.0, 0.0,
            s.z,  c.z, 0.0, 0.0,
            0.0,  0.0, 1.0, 0.0,
            0.0,  0.0, 0.0, 1.0 );

    fColor = vColor;
    gl_Position = rz * ry * rx * vPosition * scale * projectionMatrix * modelViewMatrix;
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