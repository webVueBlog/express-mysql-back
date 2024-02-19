const createError = require("http-errors");// 引入http-errors模块，作用是创建HTTP错误
const express = require("express");// 引入express模块，作用是创建Express应用
const path = require("path");// 引入path模块，作用是处理文件路径
const cookieParser = require("cookie-parser");// 引入cookie-parser模块，作用是解析cookie
const logger = require("morgan");// 引入morgan模块,作用是记录请求日志
const dayjs = require("dayjs");// 引入dayjs模块，作用是处理日期和时间
const { getTokenRule } = require("./common/jwt");// 引入jwt模块，作用是生成token
const { query } = require("./common/mysql");// 引入mysql模块，作用是操作数据库
const indexRouter = require("./routes/index");// 引入index路由模块，作用是处理首页请求

const app = express();// 创建Express应用

// view engine setup，作用是设置视图引擎
app.set("views", path.join(__dirname, "views"));// 设置视图文件的存放路径
app.set("view engine", "ejs");// 设置视图引擎为ejs

app.all("*", function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");//设置允许跨域的域名，*代表允许任意域名跨域
  //允许的header类型
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  //跨域允许的请求方式
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  // 可以带cookies
  res.header("Access-Control-Allow-Credentials", true);
  // 设置预检请求的有效期，单位为秒
  if (req.method == "OPTIONS") {
    res.sendStatus(200);// 结束请求
  } else {
    next();// 继续处理请求
  }
});

app.use(logger("dev"));// 记录请求日志
app.use(express.json());// 解析请求体中的JSON数据
app.use(express.urlencoded({ extended: false }));// 解析请求体中的URL-encoded数据
app.use(cookieParser());// 解析cookie数据
app.use(express.static(path.join(__dirname, "public")));// 设置静态文件存放路径
app.use(getTokenRule()); // jwt 权限设置
// 验证token是否有效
app.use(function (err, req, res, next) {
  // 验证失败的情况
  if (err.name === "UnauthorizedError") {
    next(createError(401));// 返回401错误，401代表
    // 未授权
  }
});
app.use("/api/react-ant-admin", indexRouter);// 设置路由中间件

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));// 404代表
  // 未找到页面
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;// 错误信息
  res.locals.error = req.app.get("env") === "development" ? err : {};// 错误对象
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;// 获取客户端IP地址
  let url = req.url;// 获取请求的URL地址
  let time = dayjs().format("YYYY-MM-DD HH:mm:ss");// 获取当前时间
  let statusCode = err.status || 500;// 获取错误状态码
  ip = ip.match(/\d+\.\d+\.\d+\.\d+/)[0];// 获取客户端IP地址
  let sql = "insert into statistics values(null,?,?,?,?)";// 插入数据库的SQL语句
  let params = [ip, url, time, statusCode];// 插入数据库的参数
  query(sql, params, function (err) {// 执行SQL语句
    if (err) {// 如果有错误信息
      return console.log(err);// 打印错误信息
    }
    console.log(err);// 打印错误信息
  });
  // render the error page
  res.status(statusCode);// 设置错误状态码
  res.render("error");// 渲染错误页面
});

module.exports = app;
/**
 * @description 服务端
 */

// const Koa = require('koa')
// const app = new Koa()
// const json = require('koa-json')
// const onerror = require('koa-onerror')
// const bodyparser = require('koa-bodyparser')
// const logger = require('koa-logger')
// const koaStatic = require('koa-static')
// const cors = require('koa2-cors')
//
// app.use(cors())
//
// const router = require('./router')
//
// // error handler
// onerror(app)
//
// // middlewares
// app.use(
//     bodyparser({
//       enableTypes: ['json', 'form', 'text'],
//     })
// )
// app.use(json())
// app.use(logger())
// const staticPath = path.join(__dirname, '..') // 根目录
// app.use(koaStatic(staticPath))
//
// // logger
// app.use(async (ctx, next) => {
//   const start = new Date()
//   await next()
//   const ms = new Date() - start
//   console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
// })
//
// // routes
// app.use(router.routes(), router.allowedMethods())
//
// // error-handling
// app.on('error', (err, ctx) => {
//   console.error('server error', err, ctx)
// })
//
