var buffer_cnts = [0];
var vertices = [];
var normals = [];


var materialAmbientSet = [];
var materialDiffuseSet = [];
var materialSpecularSet = [];
var materialShininessSet = [];

var mvMatrixSet = [];

var centerSet = [];
var directionSet = [];

function gl_help_new_buffer(triangles, material, center, direction){
    let len = triangles.length;

    let last = buffer_cnts[buffer_cnts.length-1];

    buffer_cnts.push(last+len);

    materialAmbientSet.push(material[0]);
    materialDiffuseSet.push(material[1]);
    materialSpecularSet.push(material[2]);
    materialShininessSet.push(material[3]);

    for (let i=0; i<len; ++i) vertices.push(triangles[i]);
    for (let i=0; i<len; i+=3){
        let t1 = subtract(triangles[i+1], triangles[i]);
        let t2 = subtract(triangles[i+2], triangles[i]);
        let normal = vec4(normalize(cross(t1, t2)));
        normal = vec3(normal);
        normals.push(normal);
        normals.push(normal);
        normals.push(normal);
    }

    let mvMatrix = mat4();
    mvMatrixSet.push(mvMatrix);
    centerSet.push(center);
    directionSet.push(direction);
}

function gl_help_load_buffer(gl, program, normalName, positionName){    
    let nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    let vNormal = gl.getAttribLocation( program, normalName );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
    let vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    let vPosition = gl.getAttribLocation( program, positionName );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
}

function gl_help_draw(gl, program, idx, light){

    //gl.uniformMatrix4fv( gl.getUniformLocation(program, "mvMatrix"), false, flatten(mvMatrixSet[idx-1]) );

    ambientProduct = mult(light[0], materialAmbientSet[idx-1]);
    diffuseProduct = mult(light[1], materialDiffuseSet[idx-1]);
    specularProduct = mult(light[2], materialSpecularSet[idx-1]);
    materialShininess = materialShininessSet[idx-1];
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"),materialShininess);
    /*gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );*/

    //console.log(buffer_cnts[idx-1]);
    //console.log(buffer_cnts[idx]-buffer_cnts[idx-1]);

    gl.drawArrays( gl.TRIANGLES, buffer_cnts[idx-1], buffer_cnts[idx]-buffer_cnts[idx-1]);
}