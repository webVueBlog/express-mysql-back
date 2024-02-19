const secret = "1024bibi.com";
const jwt = require("jsonwebtoken");// 引入jsonwebtoken包
const exjwt = require("express-jwt");// 引入express-jwt包

function getToken(config) {
  let token = jwt.sign(config, secret, {// 签发token
    algorithm: "HS256",// 使用HS256算法
    expiresIn: 3600 * 12, // 12 hours
  });
  return token.replace(/\n/g, "");// 去除换行符
}

function getTokenRule() {// 获取token规则
  return exjwt({// 验证token的规则
    secret,// 签名
    algorithms: ["HS256"],// 加密算法
    credentialsRequired: false,// 是否要求token
    getToken(req) {// 获取token
      // 优先级是：请求头 > 请求体 > 查询参数
      // 如果前端没有携带token，则token为空
      // 如果前端携带token，则token为token值
      // 如果前端携带token，并且token值有效，则token为token值
      return req.headers.authorization || req.body.token || req.query.token || null;
    },
  }).unless({ path: ["/api/react-ant-admin/login"] });// 排除不需要验证token的接口
}

module.exports = {
  getTokenRule,
  getToken,
};
