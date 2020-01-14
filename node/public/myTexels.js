var texSize = 64;
var numRows = 8;
var numCols = 8;

var myTexels = new Uint8Array(4*texSize*texSize);

for(var i=0;i<texSize;i++){
    for(var j=0;j<texSize;j++){
        var patchx = Math.floor(i/(texSize/numRows));
        var patchy = Math.floor(j/(texSize/numCols));
        
        var c = (patchx%2 !== patchy%2 ? 255:0);

        //c = 255;

        myTexels[4*i*texSize+4*j] = c;
        myTexels[4*i*texSize+4*j+1] = c;
        myTexels[4*i*texSize+4*j+2] = c;
        myTexels[4*i*texSize+4*j+3] = 255;
    }
}
//console.log(myTexels);
