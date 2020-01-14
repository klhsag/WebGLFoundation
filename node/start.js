const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
 
let objCnt = 0;
let objData = [];
let objName = [];
let objNum = [];


// 配置模板引擎
app.engine('html', exphbs({
  layoutsDir: 'views',
  defaultLayout: 'layout',
  extname: '.html'
}));
app.set('view engine', 'html');
 
// 如果在环境变量内, 设定了程序运行端口，则使用环境变量设定的端口号, 否则使用3000端口
app.set('port', process.env.PORT || 3000);
 
 
 
// 匹配静态文件目录
app.use(express.static('public'));

let modelCntLoc = 0;
let modelNameLoc = [];
let modelListLoc = [];
 
// 匹配根路由 / (如果不特别指明返回的状态码, 则默认返回200)
app.get('/', function(req, res) {
  //console.log(modelListLoc);
  res.render('index', {
    layout: false,
    modelCnt: modelCntLoc,
    modelName: modelNameLoc,
    modelList: modelListLoc/*[{
       objId: "obj_1",
       content: "mtl_1"
    }, {
      objId: "c",
    }]*/
  });
});
 
// 定制 404 页面 (返回404状态码)
app.use(function(req, res) {
  let currentTime = new Date();
  res.type('text/plain');
  res.status(404);
  res.send('404 - 你访问的页面可能去了火星\n' + currentTime);
});
 
 
//定制 500 页面 (返回500状态码)
app.use(function(err, req, res, next) {
  let currentTime = new Date();
  let errInfo = err.stack;
  res.type('text/plain');
  res.status(500);
  res.send('500 - 服务器发生错误\n' + 'errInfo:' + errInfo + '\n' + 'currentTime:' + currentTime);
});


// 监听服务端口, 保证程序不会退出
app.listen(app.get('port'), function() {
  console.log('Express 服务正在运行在 http://localhost:' + app.get('port') + '; 按 Ctrl-C 关闭服务.');
});

var fs = require("fs");

var objParser = require("./obj-parse");

fs.readFile('models/obj-settings.txt', function(err, data){
  
  let src = ""+data;
  let objlist = src.split(/\r\n|[\n\r]/);
  
  objCnt = objlist.length;
  for (let i in objlist){
      let thisList = objlist[i].split(/\s*\*/);
      objName.push(thisList[0]);
      objData.push([]);
      if (thisList.length==1) objNum.push(1.0);
      else objNum.push(parseFloat(thisList[1]));
  }

  let rdcnt = objCnt;

  for (let i in objlist){
    fs.readFile("models/"+objName[i], function(err, data){
      if (err){
        --rdcnt;
        return;
      }

      objData[i] = i;

      objParser.parseObj(data, function(err, mtls){

        for (let j in mtls){
            let cnt = mtls[j].vs.length;

            let tmp = JSON.stringify(mtls[j].vs);
            mtls[j].vs = [];
            mtls[j].vs = JSON.parse(tmp);

            for (let k = 0; k<cnt; ++k){
              //console.log(mtls[j].vs[0][0]);
              mtls[j].vs[k][0] = mtls[j].vs[k][0]*objNum[i];
              mtls[j].vs[k][1] = mtls[j].vs[k][1]*objNum[i];
              mtls[j].vs[k][2] = mtls[j].vs[k][2]*objNum[i];
            }
        }

        //console.log(mtls[0]);
        

        objData[i] = mtls;
        --rdcnt;

      });

    });

  }


  let interval =  setInterval(()=>{
    
    //console.log(rdcnt);

    if (rdcnt==0){
      //console.log("once");
      modelCntLoc = objCnt;
      modelNameLoc - [];
      modelListLoc = [];//new Object();
      //modelListLoc.data = [];
      
      for (let i in objData){
        let name = new Object();
        name.idx = "obj_select_"+i;
        name.name = objName[i].replace(/\..*/, "");
        modelNameLoc.push(name);
        modelListLoc.push(objData[i]);
      }

      //console.log(modelListLoc);

      modelListLoc = JSON.stringify(modelListLoc);

      clearInterval(interval);
    }
  }, 100);


});