const Koa = require('koa');
const { resolve } = require('path');

const koaBody = require('koa-body');
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser'); //post数据处理
const router = require('koa-router')(); //路由模块
// 初始化 router2
const router2 = require('koa-router')();
const logger = require('koa-logger');
const sqlite3 = require('sqlite3').verbose();
const staticServer = require('koa-static');
const { nextTick } = require('process');


const db = new sqlite3.Database("./data/db.db", function (err) {
  if (err) throw err;
});
const tableName = 'viewer';
const databaseFile = './data/db.db';
// 连接数据库(不存在就创建,存在则打开)
function connectDataBase(db, databaseFile) {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(databaseFile, function (err) {
      if (err) reject(new Error(err));
      resolve('数据库连接成功');
    });
  });
}
// 检查是否 表创建成功 / 已存在,不需要重新创建该表
function createTable(sentence) {
  return new Promise((resolve, reject) => {
    db.exec(sentence, function (err) {
      if (err) reject(new Error(err));
      resolve(`表创建成功 / 已存在,不需要重新创建该表`);
    });
  });
}

function insertData(insertViewerData) {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all("select * from source", function (err, rows) {
        if (err) throw err;
        if (rows.length === 0) {
          db.run('INSERT INTO source (id,data) VALUES (?,?)', '1', insertViewerData, function (err) {
            if (err) reject(new Error(err));
            resolve(`插入成功`);
          });
        }
      });
    });
  });
}

function updateData(updateViewerData) {
  const strData = JSON.stringify(updateViewerData)
 // console.log(strData)
  return new Promise((resolve, reject) => {
    db.run('UPDATE  source set data = ? WHERE id = ?', strData, '1', function (err) {
     //  if (err) reject(new Error(err));
      if (err) {
        console.log(err)
        reject({ success:404})
      };
      resolve({ success:200});
    });
  });
}

function getData() {
  return new Promise((resolve, reject) => {
    db.get("select * from source", function (err, rows) {
      //if (err) throw err;
      if (err) {
        // reject(new Error(err))
        console.log(err)
        return null;
      }
      resolve(rows);
      // return rows;
    });
  });
}

const viewerData = [{ "id": "0", "item": { "type": "Panel", "config": { "text": "页面1", "color": "rgba(60,60,60,1)", "width": 1366, "height": 768, "layerList": [{ "id": "0", "zIndex": 2, "visibility": 1, "desc": "默认层级" }] }, "h": "0px", "editableEl": [{ "key": "text", "name": "名称", "type": "Text" }, { "key": "color", "name": "背景颜色", "type": "Color" }, { "key": "width", "name": "宽", "type": "Number" }, { "key": "height", "name": "高", "type": "Number" }, { "key": "layerList", "name": "层级", "type": "LayerList", "cropRate": 2 }], "category": "basePanel", "x": 0, "w": "0px" }, "point": { "i": "x-0", "x": 0, "y": 0, "w": 1, "h": 1, "isBounded": true }, "status": "initCanvas" }]
const viewerStrData = JSON.stringify(viewerData)
//const viewerJsonData =  JSON.parse(viewerStrData)

connectDataBase(db, databaseFile, tableName, viewerStrData).then((result) => {
  console.log(result);
  // 创建表(如果不存在的话,则创建,存在的话, 不会创建的,但是还是会执行回调)
  const sentence = `
     create table if not exists source(
      id INT PRIMARY KEY  NOT NULL,
      data TEXT DEFAULT NULL
      );`;
  return createTable(sentence).then((result) => {
    console.log(result);
    return insertData(viewerStrData);
  })
}).then((result) => {
  console.log(result);
}).catch((err) => {
  console.error(err);
});


// // Run Create Table
// db.run(`create table user (id INT,name VARCHAR,password VARCHAR)`, function(
//   err
// ) {
//   if (err) throw err;
//   console.log("Create Table Success!");
// });

// // Run Insert Data
// db.run(`insert into user values (1,"admin","admin")`, function(err) {
//   if (err) throw err;
//   console.log("Insert Data Success!");
// });

// // Run Update Data
// db.run(`update user set name = "admin123" WHERE id = 1`, function(err) {
//   if (err) throw err;
//   console.log("Update Data Success!");
// });


// // Run Delete Data
// db.run(`delete from user WHERE id = 1`, function(err) {
//   if (err) throw err;
//   console.log("Delete Data Success!");
// });

// // Run Drop Table
// db.run(`drop table user`, function(err) {
//   if (err) throw err;
//   console.log("Drop Table Success!");
// });
// // Get select Data
// db.get("select * from user", function(err, row) {
//   if (err) throw err;
//   console.log(row.id); //0
// });





/*
// 初始化 router1
const router1 = require('koa-router')();

// 初始化 router2
const router2 = require('koa-router')();

// 使用router1做一些事情
router1.get('/', (ctx, next) => {
  ctx.body = 'router1';
  next();
});
router1.get('/:id', (ctx, next) => {
  console.log(22222222);
  console.log(ctx.params);
  next();
});

// 使用router2嵌套router1
router2.use('/user/:id/xxx', router1.routes(), router1.allowedMethods());


// 加载路由中间件
app.use(router2.routes());
*/



const app = new Koa();

// 使用router2做一些事情
router2.get("/getdata", async ctx => {
  let data = await getData();
  ctx.body = data.data;
   console.log("{request get success:200}")
   // next();
})
router2.post("/updatedata", async ctx => {
  let data = await updateData(ctx.request.body.data);
  ctx.body = data;
  console.log(data)
   // next();
})

// 使用router2嵌套router1
router.use('/api', router2.routes(), router2.allowedMethods());

router.get("/err", async ctx => {
  let data = "讨厌！ヾ(≧▽≦*)o";
  ctx.body = data;
})
router.get("/", async ctx => {
  let data = "讨厌！ヾ(≧▽≦*)o";
  ctx.body = data;
})
// 设置跨域
// app.use(
//   cors({
//     origin: function (ctx) {
//       if (ctx.url.indexOf('/updatedata') > -1) {
//         return '*'; // 允许来自所有域名请求
//       }
//       return '';
//     },
//     exposeHeaders: ['WWW-Authenticate', 'Server-Authorization', 'x-test-code'],
//     maxAge: 5, //  该字段可选，用来指定本次预检请求的有效期，单位为秒
//     credentials: true,
//     allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowHeaders: [
//       'Content-Type',
//       'Authorization',
//       'Accept',
//       'x-requested-with',
//       'Content-Encoding',
//     ],
//   }),
// );

app.use(cors());
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());
//app.use(koaBody());
app.use(logger());
app.use(staticServer(resolve(__dirname, './static')));


// let htmlStr = '';

// app.use(async (ctx, next) => {
//   console.log(ctx.url);
//   if (ctx.url === '/render') {
//     htmlStr = ctx.request.body;
//     ctx.body = 'success';
//   } else if (ctx.url.indexOf('/html') === 0) {
//     ctx.type = 'html';
//     ctx.body = htmlStr;
//   }
// });



//app.use(router.routes())

app.listen(3000,()=>{
  console.log('http://127.0.0.1:3000/');
});
