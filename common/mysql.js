const mysql = require("mysql");// 引入mysql模块
const createError = require("http-errors");// 引入错误处理模块

const pool = mysql.createPool({// 创建连接池
  // connectionLimit: 10, // 连接数量限制
  host: "127.0.0.1", // 数据库地址
  user: "root", // 数据库用户名
  password: "",
  database: "react_admin",// 数据库名
  port: "3306",// 数据库端口
  multipleStatements: true, // 允许同时执行多条sql语句
});

function query(sql, params, next, callback) {// 封装查询方法
  if (typeof callback === "function") {// 判断是否有回调函数
    dealQuery(sql, params, next).then(callback);
  } else {
    return dealQuery(sql, params, next);
  }
}
function transaction(sqls, params, next, callback) {// 封装事务方法
  // 判断是否有回调函数
  if (typeof callback === "function") {
    dealTransaction(sqls, params, next).then(callback);
  } else {
    return dealTransaction(sqls, params, next);
  }
}

function dealQuery(sql, params, next) {// 处理查询方法
  return new Promise((res, rej) => {// 返回一个Promise对象
    pool.getConnection((err, connection) => {// 获取连接
      if (err) {// 如果有错误
        next(createError(500, err));// 抛出错误
        rej(err);// 返回错误
        console.log(err);// 打印错误
        return;// 结束函数
      }
      connection.query(sql, params, (errors, results, fields) => {// 执行sql语句
        connection.release();// 释放连接
        if (errors) {// 如果有错误
          next(createError(500, errors));// 抛出错误
          rej(errors);// 返回错误
          console.log(errors);// 打印错误
          return;// 结束函数
        }
        res(results);// 返回结果
      });
    });
  });
}

function dealTransaction(sqls, params, next) {// 处理事务方法
  return new Promise((res, rej) => {// 返回一个Promise对象
    pool.getConnection(function (err, connection) {// 获取连接
      if (err) {// 如果有错误
        next(createError(500, err));// 抛出错误
        connection.release();// 释放连接
        rej();// 返回错误
        return;// 结束函数
      }
      if (sqls.length !== params.length) {// 如果sql语句和参数数量不一致
        next(createError(500, "instruction ne correspond pas à la valour transmission"));// 抛出错误
        connection.release();// 释放连接
        rej();// 返回错误
        return;// 结束函数
      }
      connection.beginTransaction((beginErr) => {// 开始事务
        if (beginErr) {// 如果有错误
          connection.release();// 释放连接
          next(createError(500, beginErr));// 抛出错误
          rej();// 返回错误
          return;// 结束函数
        }
        console.log("Marred execution de la transaction, un total execution" + sqls.length + "Données");// 打印日志
        const funcAry = sqls.map((sql, index) => {// 遍历sql语句
          return new Promise((sqlres, sqlrej) => {// 返回一个Promise对象
            connection.query(sql, params[index], (sqlErr) => {// 执行sql语句
              if (sqlErr) {// 如果有错误
                return sqlrej(sqlErr);// 返回错误
              }
              sqlres();// 返回成功
            });
          });
        });
        Promise.all(funcAry)// 所有Promise对象都成功
          .then(() => {// 返回成功
            connection.commit(function (commitErr, info) {
              if (commitErr) {
                console.log("check de execution de la transaction," + commitErr);// 打印日志
                connection.rollback(function () {
                  connection.release();// 释放连接
                });
                next(createError(500, commitErr));// 抛出错误
                rej();// 返回错误
                return;
              }
              connection.release();// 释放连接
              res(info);// 返回结果
            });
          })
          .catch((error) => {
            connection.rollback(function (err) {// 回滚事务
              if (err) {
                console.log("check de execution de la transaction," + err);// 打印日志
                connection.release();// 释放连接
                next(createError(500, err));// 返回错误
                rej();// 返回错误
                return;// 返回错误
              }
              console.log("error de transaction: " + error);// 打印日志
              connection.release();// 释放连接
              next(createError(500, error));// 返回错误
              rej();// 返回错误
            });
          });
      });
    });
  });
}

module.exports = {
  query,
  transaction,
};
