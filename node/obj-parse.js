
function parseObj(src, callback){

    let curObj = new Object();

    let mtlName = "";
    let vs = [[0.0, 0.0, 0.0]];
    let vts = [[0.0, 0.0]];
    let vns = [[0.0, 0.0, 1.0]];
    
    let curMtl = null;
    let mtls = [];

    src = ""+src;

    src = src.replace(/#.*/g, "");

    lns = src.split(/[\n\r]+/);

    for (let i in lns){
        let tln = lns[i].trim();
        let words = tln.split(/\s+/);
        let len = words.length;

        while ((words[0]=='')) words.shift();

        if (words[0]=="mtllib"){
            mtlName = words[1];
            //console.log(mtlName);
        }else if (words[0]=="v"){
            if (len!=4 && len!=5) console.log("error!");
            vs.push([parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3])]);

        }else if (words[0]=="vt"){
            if (len!=3 && len!=4) console.log("error!");
            vts.push([parseFloat(words[1]), parseFloat(words[2])]);
        }else if (words[0]=="vn"){
            if (len!=4 && len!=5) console.log("error!");
            vns.push([parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3])]);
        }else if (words[0]=="usemtl"){
            if (curMtl) mtls.push(curMtl);
            curMtl = new Object();
            curMtl.mtl = words[1];
            curMtl.vs = [];
            curMtl.vts = [];
            curMtl.vns = [];
            curMtl.Ka = [0.0, 0.0, 0.0];
            curMtl.Kd = [0.0, 0.0, 0.0];
            curMtl.Ks = [0.0, 0.0, 0.0];
            curMtl.Ns = 1.0;                  //default
            curMtl.map_Kd = "";
            
        }else if (words[0]=="f"){
            if (len<4) console.log("error!");
            let fids = [];
            for (let j=1; j<len; ++j){
                let strs = words[j].split("/");
                let ids = [];
                for (let k in strs){
                    ids.push(parseInt("0"+strs[k]));
                }
                while (ids.length<3) ids.push(0);
                fids.push(ids);
            }

            //console.log(fids);

            for (let k=2; k<len-1; ++k){
                let j = k-1;

                curMtl.vs.push(vs[fids[0][0]]);
                curMtl.vs.push(vs[fids[j][0]]);
                curMtl.vs.push(vs[fids[k][0]]);
                curMtl.vts.push(vts[fids[0][1]]);
                curMtl.vts.push(vts[fids[j][1]]);
                curMtl.vts.push(vts[fids[k][1]]);
                curMtl.vns.push(vns[fids[0][2]]);
                curMtl.vns.push(vns[fids[j][2]]);
                curMtl.vns.push(vns[fids[k][2]]);


            }
        }

    }

    //console.log(curMtl);
    if (curMtl) mtls.push(curMtl);
    //console.log(mtls);

    let fs = require("fs");

    fs.readFile("models/"+mtlName, function(err, data){
        
        //console.log(err);
        
        if (err){
            //?
            return;
        }
        src = ""+data;
        src = src.replace(/#.*/g, "");
        lns = src.split(/[\n\r]+/);

        curIdx = 0;
        for (let i in lns){
            let tln = lns[i].trim();
            let words = tln.split(/\s+/);

            while ((words[0]=='')) words.shift();

            let len = words.length;
            if (words[0]=="newmtl"){
                let curName = words[1];
                curIdx = 0;
                while (curIdx<mtls.length && mtls[curIdx].mtl!=curName) ++curIdx;
            }else if (curIdx>=mtls.length){
                continue;
            }else if (words[0]=="Ka"){
                mtls[curIdx].Ka = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3])];
            }else if (words[0]=="Kd"){
                mtls[curIdx].Kd = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3])];
            }else if (words[0]=="Ks"){
                mtls[curIdx].Ks = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3])];
            }else if (words[0]=="Ns"){
                mtls[curIdx].Ns = parseFloat(words[1]);
            }else if (words[0]=="map_Kd"){
                mtls[curIdx].map_Kd = tln.replace(/.*map_Kd\s+/, "");
                //console.log(mtls[curIdx].map_Kd);            
            }

        }

        callback(err, mtls);

    });


}


module.exports.parseObj = parseObj;