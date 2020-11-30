const HandleDB =  require('./sqliteConnectTools');

let db = new HandleDB({
    databaseFile: './data/viewer.db',
    tableName: 'ads'
  });
  
  db.connectDataBase().then((result)=>{
    console.log(result);
    // 创建表(如果不存在的话,则创建,存在的话, 不会创建的,但是还是会执行回调)
    let sentence = `
       create table if not exists ${db.tableName}(
            begin_time varchar(255),
            create_time varchar(255),
            end_time varchar(255),
            id varchar(255),
            postion_id int(50),
            status int(50),
            task_id int(50),
            same_day int(50)
        );`;
    return db.createTable(sentence);
  }).then((result)=>{
    console.log(result);
    doLogic();
  }).catch((err)=>{
    console.error(err);
  });
  
  let doLogic = function() {
  
    // 增
    db.sql(`insert into ${db.tableName} (begin_time, create_time, end_time, play_id, postion_id, status, task_id, same_day) values(?, ?, ?, ?, ?, ?, ?, ?)`,
        ['2017/7/12', '2017/7/12', '2017/7/12', 102, 3, 0, 11, '2017-7-12']).then((res)=>{
        console.log(res);
    }).catch((err)=>{
        console.log(err);
    });
  
    // 一次性插入多个数据
    var data = {
        "Body": [
            {
                "begin_time": "1970-01-01 00:00:00",
                "create_time": "2017-07-11",
                "end_time": "",
                "play_id": 17,
                "postion_id": 1,
                "status": 0,
                "task_id": 24
            },
            {
                "begin_time": "1970-01-01 00:00:00",
                "create_time": "2017-07-11",
                "end_time": "",
                "play_id": 18,
                "postion_id": 4,
                "status": 0,
                "task_id": 24
            },
            {
                "begin_time": "1970-01-01 00:00:00",
                "create_time": "2017-07-11",
                "end_time": "",
                "play_id": 19,
                "postion_id": 2,
                "status": 0,
                "task_id": 24
            },
            {
                "begin_time": "1970-01-01 00:00:00",
                "create_time": "2017-07-11",
                "end_time": "",
                "play_id": 20,
                "postion_id": 3,
                "status": 0,
                "task_id": 24
            }
        ],
        "Code": 0,
        "Message": ""
    };
    var arr = data.Body;
    var promises = arr.map(function(obj) {
        return db.sql(`insert into ${db.tableName} (begin_time, create_time, end_time, play_id, postion_id, status, task_id, same_day) values(?, ?, ?, ?, ?, ?, ?, ?)`,
            [obj.begin_time, obj.create_time, obj.end_time, obj.play_id, obj.postion_id, obj.status, obj.task_id, '2017-7-12']);
    });
    Promise.all(promises).then(function (posts) {
        console.log('全部插入完毕', posts)
    }).catch(function(reason){
        console.error(reason);
    });
  
    // 删
    db.sql(`delete from ${db.tableName} where same_day = ?`, '2017-7-12').then((res)=>{
        console.log(res);
    }).catch((err)=>{
        console.log(err);
    });
  
    // 改
    db.sql(`update ${db.tableName} set task_id = ? where same_day = ?`, [4, '2017-7-12']).then((res)=>{
        console.log(res);
    }).catch((err)=>{
        console.log(err);
    });
  
    // 查
    db.sql(`select * from ${db.tableName} where same_day = ?`, '2017-7-12', 'all').then((res)=>{
        console.log(res);
    }).catch((err)=>{
        console.log(err);
    });
  };