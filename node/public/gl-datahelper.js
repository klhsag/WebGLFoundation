var defaultImg = new Image();
defaultImg.src = "default.png";


var buffer_cnts = [0];
var vertices = [];
var normals = [];
var texcoors = [];

var centerSet = [];
var directionSet = [];

function gl_help_new_buffer(obj, center, direction){
    
    for (let i in obj){
        let mtl = obj[i];
        mtl.start = vertices.length;
        for (let j in mtl.vs){
            vertices.push(mtl.vs[j]);
            texcoors.push(mtl.vts[j]);
            normals.push(mtl.vns[j]);
        }

        mtl.img = new Image();
        mtl.img.src = mtl.map_Kd;
        if (mtl.map_Kd==""){
            mtl.img.src = "default.png"
        }
        
        mtl.mvMatrix = mat4();
        mtl.mvnMatrix = mat4();

    }
    //console.log(obj);
    /*for (let i=0; i<len; ++i) {
        vertices.push(triangles[i]);

        if (texs.length==0) texcoors.push(vec2(Math.floor(Math.random()*2), vec2(Math.floor(Math.random()*2))));
        else{
            texcoors.push(texs[i]);
        }
    }*/    /*console.log(texcoors);
    for (let i=0; i<len; i+=3){
        let t1 = subtract(triangles[i+1], triangles[i]);
        let t2 = subtract(triangles[i+2], triangles[i]);
        let normal = vec4(normalize(cross(t1, t2)));
        normal = vec3(normal);
        normals.push(normal);
        normals.push(normal);
        normals.push(normal);
    }*/

    //let mvMatrix = mat4();
    //mvMatrixSet.push(mvMatrix);
    //centerSet.push(center);
    //directionSet.push(direction);
}

function gl_help_load_buffer(gl, program, normalName, positionName, texName){

    console.log(texcoors);

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


    let tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texcoors), gl.STATIC_DRAW);
    let vTexcoord = gl.getAttribLocation( program, texName);
    gl.vertexAttribPointer(vTexcoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexcoord);

    console.log("!");


}

function gl_help_draw(gl, program, obj, light){

    //gl.uniformMatrix4fv( gl.getUniformLocation(program, "mvMatrix"), false, flatten(mvMatrixSet[idx-1]) );

    for (let i in obj){
        let mtl = obj[i];
        let st = mtl.start;
        let cnt = mtl.vs.length;
        let Ka = mtl.Ka.slice(0), Kd = mtl.Kd.slice(0), Ks = mtl.Ks.slice(0);
        Ka.push(1.0), Kd.push(1.0), Ks.push(1.0);
        let ambientProduct = mult(light[0], Ka);
        let diffuseProduct = mult(light[1], Kd);
        let specularProduct = mult(light[2], Ks);
        let materialShininess = mtl.Ns;
        
        gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
        gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );
        gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
        /*gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );*/
        
        /*
        console.log(vertices);
        
        console.log(st);

        console.log(cnt);
        */
        
        if (mtl.img.complete) {
            configureTextureByImg(mtl.img);
        }else{
            configureTextureByImg(defaultImg);
        }

        gl.uniformMatrix4fv(gl.getUniformLocation( program, "mvMatrix" ), false, flatten(mtl.mvMatrix));
        gl.uniformMatrix4fv(gl.getUniformLocation( program, "mvnMatrix" ), false, flatten(mtl.mvnMatrix));

        gl.drawArrays( gl.TRIANGLES, st, cnt);

    }

}