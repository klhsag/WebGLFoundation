"use strict";

var models;
var curModelIdx = 0;
function getModels(){
    //let cnt = document.getElementById( "model_cnt" ).innerHTML;
    let objListStr = document.getElementById( "model_data" ).innerHTML;
    let objList = JSON.parse(objListStr);
    
    console.log(objList);

    selectModel("obj_select_0");

    return objList;
}

function selectModel(id){
    let idx = parseInt(id.replace("obj_select_", ""));
    curModelIdx = idx;
    for (let i in models){
        let div = document.getElementById( "obj_select_"+i );
        div.style = "";
    }
    document.getElementById(id).style = "margin: 1px; border: 3px solid red;";
}

function modelListCtr(){
    let ch = document.getElementById( "model_ctr" ).innerHTML;
    if (ch=="﹀&nbsp;"){
        document.getElementById( "model_ctr" ).innerHTML = "〈&nbsp;";
        document.getElementById( "model_list" ).style = "display: none;";
    }else if (ch=="〈&nbsp;"){
        document.getElementById( "model_ctr" ).innerHTML = "﹀&nbsp;";
        document.getElementById( "model_list" ).style = "";
    }
}

function bgTexCtr(dom){
    let doms = document.getElementById("bg_options").childNodes;
    for (let i in doms){
        if (doms[i].nodeType!=1) continue;
        doms[i].style = "";
    }
    dom.style = "margin: 1px; border: 3px solid red;";
    switch(dom.innerHTML){
    case "晴空":
        configureBgTextureByImg("default.png");
        break;
    case "雨露":
        configureBgTextureByImg("water.jpg");
        break;
    case "棋盘":
        configureBgTextureByU8();
        break;
    }
}


var canvas;
var gl;
var program;

var proMatrixLoc;

var invCameraPosition = vec3(0.0, 0.0, -10.0);
var cameraTheta = 0.0;
var cameraFai = 0.0

var proMatrix = mat4();

var roll_speed = 0.0;
var roll_const = 0.0;


var camera_degree = 60.0;


var lightPosition = vec4(10.0, 10.0, 40.0, 1.0 );
var lightAmbient = vec4(0.4, 0.4, 0.4, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

function configureBgTextureByU8() {
    let texture = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, myTexels);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
}

function configureBgTextureByImg(filename) {
    

    let image = new Image();
    //image.src = "water.jpg";
    image.src = filename;
    image.onload = ()=>{
        let texture = gl.createTexture();
         gl.activeTexture( gl.TEXTURE0 );
         gl.bindTexture( gl.TEXTURE_2D, texture );
         gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
         //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap( gl.TEXTURE_2D );
    }
}

var texture1;
let t1 = 0;

function configureTextureByImg(image){
    
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
}

window.onload = function init(){

    // get models from HTML //
    models = getModels();
    //modelListCtr();
    // get models from HTML //


    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.7, 0.7, 1.0, 1.0); 

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    /* use this to get normals
    srcvs = [];
    srcvs.push(vec3(-6.0, -3.0, -20.0));
    srcvs.push(vec3( 0.0,  3.0, -14.0));
    srcvs.push(vec3( 6.0, -3.0, -20.0));
    srcvs.push(vec3(-6.0, -3.0, -20.0));
    srcvs.push(vec3(-6.0, -3.0,  -8.0));
    srcvs.push(vec3( 0.0,  3.0, -14.0));
    srcvs.push(vec3(-6.0, -3.0,  -8.0));
    srcvs.push(vec3( 6.0, -3.0,  -8.0));
    srcvs.push(vec3( 0.0,  3.0, -14.0));
    srcvs.push(vec3( 6.0, -3.0,  -8.0));
    srcvs.push(vec3( 6.0, -3.0, -20.0));
    srcvs.push(vec3( 0.0,  3.0, -14.0));    
    for (let i=0; i<srcvs.length; i+=3){
        let t1 = subtract(srcvs[i+1], srcvs[i]);
        let t2 = subtract(srcvs[i+2], srcvs[i]);
        let normal = vec4(normalize(cross(t1, t2)));
        normal = vec3(normal);
        console.log("normal");
        console.log(normal);
    }*/

    for (let i in models){
        gl_help_new_buffer(models[i],
            vec4(0.0, 0.0, 0.0, 1.0),
            vec4(0.0, 0.0, 1.0, 0.0));
    }

    gl_help_load_buffer(gl, program, "vNormal", "vPosition", "vTexcoord");

    texture1 = gl.createTexture();

    configureBgTextureByU8();
    configureBgTextureByImg("default.png");

// 用 1x1 个蓝色像素填充纹理
/*gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
              new Uint8Array([0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255]));
*//* 异步加载图像
var image = new Image();
//image.crossOrigin = '';
image.src = "f-texture.png";
image.onload = function() {
  // 现在图像加载完成，拷贝到纹理中gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
};*/


    gl.uniform1i(gl.getUniformLocation(program, "bg_texture"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "u_texture"), 1);


    proMatrixLoc = gl.getUniformLocation( program, "proMatrix" );
    //mdMatrixLoc = gl.getUniformLocation( program, "mdMatrix" );
    //bgMatrixLoc = gl.getUniformLocation( program, "bgMatrix" );


/*
    canvas.addEventListener("mousedown", function(event){
        let x = 2*event.clientX/canvas.width-1;
        let y = 2*(canvas.height-event.clientY)/canvas.height-1;
        startMotion(x, y);
    });
  
    canvas.addEventListener("mouseup", function(event){
        let x = 2*event.clientX/canvas.width-1;
        let y = 2*(canvas.height-event.clientY)/canvas.height-1;
        stopMotion(x, y);
    });
  
    canvas.addEventListener("mousemove", function(event){
        let x = 2*event.clientX/canvas.width-1;
        let y = 2*(canvas.height-event.clientY)/canvas.height-1;
        mouseMotion(x, y);
    });
*/

    document.getElementById( "gl-canvas" ).onmousewheel = function(e) {
        e = e || window.event;
	    if(e.wheelDelta){
            if (e.wheelDelta){
                let delta = -e.wheelDelta/50.0;
                if (delta>0 && camera_degree+delta<90) camera_degree+=delta;
                if (delta<0 && camera_degree+delta>45) camera_degree+=delta;
            }
        }
    };
    
    document.getElementById( "x_coor" ).innerHTML = lightPosition[0];
    document.getElementById( "y_coor" ).innerHTML = lightPosition[1];
    document.getElementById( "z_coor" ).innerHTML = lightPosition[2];

    document.getElementById("light_settings").onclick = function(){
        let x = parseFloat(document.getElementById("light_position_x").value);
        let y = parseFloat(document.getElementById("light_position_y").value);
        let z = parseFloat(document.getElementById("light_position_z").value);
        document.getElementById( "x_coor" ).innerHTML = x;
        document.getElementById( "y_coor" ).innerHTML = y;
        document.getElementById( "z_coor" ).innerHTML = z;
        lightPosition = vec4(x, y, z, 0.0);
        let r = parseFloat(document.getElementById("light_ambient_r").value);
        let g = parseFloat(document.getElementById("light_ambient_g").value);
        let b = parseFloat(document.getElementById("light_ambient_b").value);
        lightAmbient = vec4(r, g, b, 1.0 );
        r = parseFloat(document.getElementById("light_diffuse_r").value);
        g = parseFloat(document.getElementById("light_diffuse_g").value);
        b = parseFloat(document.getElementById("light_diffuse_b").value);
        lightDiffuse = vec4(r, g, b, 1.0 );
        r = parseFloat(document.getElementById("light_specular_r").value);
        g = parseFloat(document.getElementById("light_specular_g").value);
        b = parseFloat(document.getElementById("light_specular_b").value);
        lightSpecular = vec4(r, g, b, 1.0 );

    }

    render();
};

function m_v( u, v){
    var result = [];

    for ( var i = 0; i < 4; ++i ) {
        var sum = 0.0;
        for ( var k = 0; k < 4; ++k ) {
            sum += u[i][k] * v[k];
        }
        result.push( sum );
    }

    return result;

}

function cutten( v){
    let m = 1;
    if (v[3]!=0) m = v[3];
    return vec3(v[0]/m, v[1]/m, v[2]/m);
}


var trackingMouse = false;
var trackballMove = false;
var startX = 0;
var startY = 0;
var curx = 0;
var cury = 0;
var lastPos;
var roll_axis = vec3();
var max_roll_speed = 2.0;

function render() {


    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    

    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );


    let fovy = camera_degree;
    let aspect = canvas.width/canvas.height;
    proMatrix = perspective(fovy, aspect, 1.0, 100.0);

    let cameraMatrix = mult(rotate(cameraFai, vec3(1.0, 0.0, 0.0)), rotate(cameraTheta, vec3(0.0, 1.0, 0.0)));

    proMatrix = mult(proMatrix, cameraMatrix);

    proMatrix = mult(proMatrix, translate(invCameraPosition));
    
    let eyePosition = m_v(translate(vec3(-invCameraPosition[0], -invCameraPosition[1], -invCameraPosition[2])),
        vec4(0.0, 0.0, 0.0, 1.0)
        );

    /*
    console.log(invCameraPosition);
    console.log(cameraMatrix);
    console.log(eyePosition);
    */

    gl.uniform4fv(gl.getUniformLocation( program, "eyePosition" ), eyePosition);

    gl.uniformMatrix4fv( proMatrixLoc, false, flatten(proMatrix) );

    //gl.uniformMatrix4fv(mdMatrixLoc, false, flatten(mdMatrix));
    //gl.uniformMatrix4fv(bgMatrixLoc, false, flatten(bgMatrix));

    //gl.uniformMatrix4fv(gl.getUniformLocation( program, "mvMatrix" ), false, flatten(mult(bgMatrix, mdMatrix)));

    for (let i in models){
        gl_help_draw(gl, program, models[i], [lightAmbient, lightDiffuse, lightSpecular]);
    }

    window.requestAnimFrame(render);

    if (trackballMove && roll_speed>0){
        if (!(roll_axis[0]==0.0 && roll_axis[1]==0.0 && roll_axis[2]==0.0)){
            rotate_by(roll_speed, vec4(roll_axis[0], roll_axis[1], roll_axis[2], 0.0));
            roll_speed *= 1-roll_const;
        }
    }

}

function move_by(d){
    let mtls = models[curModelIdx];
    for (let i in mtls){
        let mvMatrix = mtls[i].mvMatrix;
        let direction = m_v(mvMatrix, d);

        mvMatrix = mult(translate(cutten(direction)) , mvMatrix);
        
        mtls[i].mvMatrix =mvMatrix;

        //console.log(m_v(mvMatrix, vec4(0.0, 0.0, 0.0, 1.0) ));
        //console.log(lightPosition);
    }
}

function spin_by(angle, dv){
    let mtls = models[curModelIdx];
    for (let i in mtls){
        let mvMatrix = mtls[i].mvMatrix;
        let mvnMatrix = mtls[i].mvnMatrix;

        let R = mat4();
        let ctm = mat4();

        let center = m_v(mvMatrix, vec4(0.0, 0.0, 0.0, 1.0));
        let direction = m_v(mvMatrix, dv);

        R = mult(R, rotate(angle, cutten(direction)) );

        ctm = mult(ctm, translate(cutten(center)));
        ctm = mult(ctm, R);
        ctm = mult(ctm, translate(negate(cutten(center))));

        mvMatrix = mult(ctm, mvMatrix);


        mtls[i].mvMatrix =mvMatrix;
        mvnMatrix = mult(R, mvnMatrix);
        mtls[i].mvnMatrix =mvnMatrix;
    }

}

/*
function drug_by(d){
    bgMatrix = mult(translate(cutten(d)), bgMatrix);
}

function rotate_by(angle, dv){

    let R = mat4();
    let ctm = mat4();

    R = mult(R, rotate(angle, cutten(dv)) );

    ctm = mult(ctm, R);

    bgMatrix = mult(ctm, bgMatrix);

}*/


window.addEventListener("keydown", function() {
    console.log(event.keyCode);

    var theta;

    switch (event.keyCode) {
        //self
        case 87:
            move_by(vec4(0.0, 0.0, 0.1, 0.0));
            break;
        case 83:
            move_by(vec4(0.0, 0.0, -0.1, 0.0));
            break;
        case 65:
            spin_by(2.0, vec4(0.0, 1.0, 0.0, 0.0));
            break;
        case 68:
            spin_by(2.0, vec4(0.0, -1.0, 0.0, 0.0));
            break;
        case 90:
            spin_by(2.0, vec4(1.0, 0.0, 0.0, 0.0));
            break;
        case 67:
            spin_by(2.0, vec4(-1.0, 0.0, 0.0, 0.0));
            break;
        case 81:
            spin_by(2.0, vec4(0.0, 0.0, 1.0, 0.0));
            break;
        case 69:
            spin_by(2.0, vec4(0.0, 0.0, -1.0, 0.0));
            break;
        //coord
        //drug
        case 37:
            drug_by(vec4(-0.2, 0.0, 0.0, 0.0));
            break;
        case 39:
            drug_by(vec4(0.2, 0.0, 0.0, 0.0));
            break;
        case 38:
            drug_by(vec4(0.0, 0.2, 0.0, 0.0));
            break;
        case 40:
            drug_by(vec4(0.0, -0.2, 0.0, 0.0));
            break;
        //rotate
        case 73:
            rotate_by(2.0, vec4(1.0, 0.0, 0.0, 0.0));
            break;
        case 79:
            rotate_by(2.0, vec4(0.0, 1.0, 0.0, 0.0));
            break;
        case 80:
            rotate_by(2.0, vec4(0.0, 0.0, 1.0, 0.0));
            break;
        
        case 74:
            rotate_by(2.0, vec4(-1.0, 0.0, 0.0, 0.0));
            break;
        case 75:
            rotate_by(2.0, vec4(0.0, -1.0, 0.0, 0.0));
            break;
        case 76:
            rotate_by(2.0, vec4(0.0, 0.0, -1.0, 0.0));
            break;
        //vr



        case 97:
            theta = cameraTheta+135;
            invCameraPosition[0] -= 0.2*Math.cos(theta*Math.PI/180);
            invCameraPosition[2] -= 0.2*Math.sin(theta*Math.PI/180);
            break;
        case 98:
            theta= cameraTheta+90;
            invCameraPosition[0] -= 0.2*Math.cos(theta*Math.PI/180);
            invCameraPosition[2] -= 0.2*Math.sin(theta*Math.PI/180);
            break;
        case 99:
            theta= cameraTheta+45;
            invCameraPosition[0] -= 0.2*Math.cos(theta*Math.PI/180);
            invCameraPosition[2] -= 0.2*Math.sin(theta*Math.PI/180);
            break;
        case 100:
            theta= cameraTheta+180;
            invCameraPosition[0] -= 0.2*Math.cos(theta*Math.PI/180);
            invCameraPosition[2] -= 0.2*Math.sin(theta*Math.PI/180);
            break;
        
        case 102:
            theta= cameraTheta;
            invCameraPosition[0] -= 0.2*Math.cos(theta*Math.PI/180);
            invCameraPosition[2] -= 0.2*Math.sin(theta*Math.PI/180);
            break;
        case 103:
            theta = cameraTheta-135;
            invCameraPosition[0] -= 0.2*Math.cos(theta*Math.PI/180);
            invCameraPosition[2] -= 0.2*Math.sin(theta*Math.PI/180);
            break;
        case 104:
            theta= cameraTheta-90;
            invCameraPosition[0] -= 0.2*Math.cos(theta*Math.PI/180);
            invCameraPosition[2] -= 0.2*Math.sin(theta*Math.PI/180);
            break;
        case 105:
            theta = cameraTheta-45;
            invCameraPosition[0] -= 0.2*Math.cos(theta*Math.PI/180);
            invCameraPosition[2] -= 0.2*Math.sin(theta*Math.PI/180);
            break;

        case 107:
            invCameraPosition[1] -= 0.1;
            break;
        case 109:
            invCameraPosition[1] += 0.1;
            break;

        case 86:
            cameraTheta -= 1.0;
            break;
        case 66:
            cameraTheta += 1.0;
            break;

        
        case 78:
            cameraFai += 0.5;
            break;
        case 77:
            cameraFai -= 0.5;
            break;

    }
});

