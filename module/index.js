const { query, transaction } = require("../common/mysql");
const { formatMenu, formatCreateTable, getVistor } = require("../utils");
const { getToken } = require("../common/jwt");
const createError = require("http-errors");
const dayjs = require("dayjs");

// service
function addService(req, res, next) {
    let userInfo = req.user;
    let sql;
    const { name, price, type, date, description, content } = req.body;// 获取前端传递的参数
    if (type === 'Event') {
        sql = "insert into event values(null,?,?,?,?,?,?,?,?)";
    } else if (type === 'Atelier') {
        sql = "insert into workshop values(null,?,?,?,?,?,?,?,?,?)";
    } else if (type === 'Course') {
        sql = "insert into course values(null,?,?,?,?,?,?,?,?,?)";
    } else if (type === 'Reservation') {
        sql = "insert into reservation values(null,?,?,?,?,?,?,?,?,?)";
    }

    let params = [
        name,
        price,
        type,
        dayjs(date).format("YYYY-MM-DD HH:mm"),
        description,
        content,
        userInfo.username,
        dayjs().format("YYYY-MM-DD HH:mm"),
    ];
    query(sql, params, next).then(() => res.send({ msg: "L'Amour est rush", status: 0 }))
}

function addSubscription(req, res, next) {
    let userInfo = req.user;
    const { weight, name, description, provider } = req.body;// 获取前端传递的参数
    if (!name || !description) return res.send({ status: 1, msg: "error de parametrise" });
    let sql = "insert into subscription values(null,?,?,?,?,?,?)";
    let params = [
        weight,
        name,
        description,
        provider,
        userInfo.username,
        dayjs().format("YYYY-MM-DD HH:ss:mm"),
    ];
    query(sql, params, next, () => res.send({ msg: "L'Amour est rush", status: 0 }));
}

// event
function getEvent(req, res, next) {
    let { page = 1, pagesize = 10 } = req.query;
    if (Number(page) < 1 || Number(pagesize) < 10)
        return res.send({ msg: "error de parametrise, veuillez essayer", status: 1 });
    const sql =
        `select SQL_CALC_FOUND_ROWS *,DATE_FORMAT(add_time,"%Y-%m-%d %H:%i:%S") as add_time from event 
limit ?,?;
  select found_rows() as total;`;
    let params = [
        (page - 1) * Number(pagesize),
        Number(pagesize),
    ];
    query(sql, params, next, (datalist) => {
        let createStr = datalist[2][0]["Create Table"];
        res.send({
            status: 0,
            data: { list: datalist[0],  total: datalist[1][0].total },
            msg: "",
        });
    });
}
function getEventById(req, res, next) {
    const { m_id } = req.params; // Assuming the m_id is provided as a URL parameter
    console.log(m_id, 'm_id');
    if (!m_id) {
        return res.status(400).send({ msg: 'Missing m_id parameter', status: 1 });
    }
    const sql =
        `SELECT *, DATE_FORMAT(add_time, "%Y-%m-%d %H:%i:%S") as add_time 
        FROM event WHERE m_id = ?;
    SELECT FOUND_ROWS() AS total;`;
    const params = [m_id];
    query(sql, params, next, (datalist) => {
        if (datalist[0].length === 0) {
            return res.status(404).send({ msg: 'Event not found', status: 1 });
        }
        const createStr = datalist[2][0]['Create Table'];

        res.send({
            status: 0,
            data: { event: datalist[0][0],  total: datalist[1][0].total },
            msg: '',
        });
    });
}

// workshop
function getWorkshop(req, res, next) {
    let { page = 1, pagesize = 10 } = req.query;
    if (Number(page) < 1 || Number(pagesize) < 10)
        return res.send({ msg: "error de paramètre, veuillez essayer", status: 1 });
    const sql =
        `select SQL_CALC_FOUND_ROWS *,DATE_FORMAT(add_time,"%Y-%m-%d %H:%i:%S") as add_time from workshop 
limit ?,?;
  select found_rows() as total;` + "show create table workshop;";
    let params = [
        (page - 1) * Number(pagesize),
        Number(pagesize),
    ];
    query(sql, params, next, (datalist) => {
        let createStr = datalist[2][0]["Create Table"];

        res.send({
            status: 0,
            data: { list: datalist[0], total: datalist[1][0].total },
            msg: "",
        });
    });
}
function addWorkshop(req, res, next) {
    let userInfo = req.user;
    const { weight, name, description, provider } = req.body;
    if (!name || !description) return res.send({ status: 1, msg: "error de paramètre" });
    let sql = "insert into workshop values(null,?,?,?,?,?,?)";
    let params = [
        weight,
        name,
        description,
        provider,
        userInfo.username,
        dayjs().format("YYYY-MM-DD HH:ss:mm"),
    ];
    query(sql, params, next, () => res.send({ msg: "L'Amour est rush", status: 0 }));
}

// course
function getCourse(req, res, next) {
    let { page = 1, pagesize = 10, name = "", description = "" } = req.query;
    if (Number(page) < 1 || Number(pagesize) < 10)
        return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    const sql =
        `select SQL_CALC_FOUND_ROWS *,DATE_FORMAT(add_time,"%Y-%m-%d %H:%i:%S") as add_time from course 
  where name like ? and description like ?  limit ?,?;
  select found_rows() as total;` + "show create table course;";
    let params = [
        `%${name}%`,
        `%${description}%`,
        (page - 1) * Number(pagesize),
        Number(pagesize),
    ];
    query(sql, params, next, (datalist) => {
        let createStr = datalist[2][0]["Create Table"];

        res.send({
            status: 0,
            data: { list: datalist[0],  total: datalist[1][0].total },
            msg: "",
        });
    });
}
function addCourse(req, res, next) {
    let userInfo = req.user;
    const { weight, name, description, provider } = req.body;
    if (!name || !description) return res.send({ status: 1, msg: "error de paramètre" });
    let sql = "insert into course values(null,?,?,?,?,?,?)";
    let params = [
        weight,
        name,
        description,
        provider,
        userInfo.username,
        dayjs().format("YYYY-MM-DD HH:ss:mm"),
    ];
    query(sql, params, next, () => res.send({ msg: "L'Amour est rush", status: 0 }));
}

// reservation
function getReservation(req, res, next) {
    let { page = 1, pagesize = 10, name = "", description = "" } = req.query;
    if (Number(page) < 1 || Number(pagesize) < 10)
        return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    const sql =
        `select SQL_CALC_FOUND_ROWS *,DATE_FORMAT(add_time,"%Y-%m-%d %H:%i:%S") as add_time from reservation 
  where name like ? and description like ?  limit ?,?;
  select found_rows() as total;` + "show create table course;";
    let params = [
        `%${name}%`,
        `%${description}%`,
        (page - 1) * Number(pagesize),
        Number(pagesize),
    ];
    query(sql, params, next, (datalist) => {
        let createStr = datalist[2][0]["Create Table"];

        res.send({
            status: 0,
            data: { list: datalist[0], total: datalist[1][0].total },
            msg: "",
        });
    });
}
function addReservation(req, res, next) {
    let userInfo = req.user;
    const { weight, name, description, provider } = req.body;
    if (!name || !description) return res.send({ status: 1, msg: "error de paramètre" });
    let sql = "insert into reservation values(null,?,?,?,?,?,?)";
    let params = [
        weight,
        name,
        description,
        provider,
        userInfo.username,
        dayjs().format("YYYY-MM-DD HH:ss:mm"),
    ];
    query(sql, params, next, () => res.send({ msg: "L'Amour est rush", status: 0 }));
}

function login(req, res, next) {
    const { account, pswd } = req.body;
    let userInfo = req.user;
    if (userInfo) return res.send({ msg: "connexion pressie", status: 0, data: userInfo });
    if (!account || !pswd) {
        return res.send({ msg: "Les information's de connexion ne event pas tre vides, veuillez réessayer!", status: 1 });
    }
    let sql = "select * from user_info where account = ? and pswd = ?";
    query(sql, [account, pswd], next, (result) => {
        if (result && result.length) {
            let data = result[0];// 用户信息
            delete data.pswd;// 删除密码字段
            const token = getToken({...data});// 生成token
            res.send({ msg: "connexion pressie", status: 0, token, data });
            return;
        }
        res.send({ status: 1, msg: "Information's de compute insurmountable, veuillez réessayer!" });
    });
}

/**
 *
 * @param {*} req
 * @param {import("express").Response} res
 * @param {*} next
 */
function getMenu(req, res, next) {
    const sql =
        "SELECT  * FROM `menu` WHERE `menu_id` IN (SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(a.`menu_id`,',',b.help_topic_id + 1),',', -1 ) as menuId FROM (SELECT  p.menu_id FROM `user_info` as u INNER JOIN `power`as p ON u.`type_id` = p.`type_id` and u.user_id = ?) as a JOIN mysql.help_topic as b ON b.help_topic_id < (LENGTH(a.`menu_id`)-LENGTH(REPLACE(a.`menu_id`,',',''))+1)) ORDER BY menu.`order`;";
    // 获取用户菜单
    if (!req.user) {
        return res.status(401).send("请登录！")
    }
    query(sql, [req.user.user_id], next, (result) => {
        let data = (result || []);
        res.send(data);
    });
}

function addMenu(req, res, next) {
    const {
        icon = "",
        key,
        parentKey = "",
        path,
        title,
        keepAlive,
        order,
    } = req.body;
    if (!key || !path || !title || !keepAlive || typeof order === "undefined")
        return res.send({
            msg: "error de paramètre",
            status: 1,
        });// 参数不全

    const sql = "insert into menu values(null,?,?,?,?,?,?,?)";
    const parmas = [title, path, key, parentKey, icon, keepAlive, order];
    query(sql, parmas, next, function () {
        res.send({
            msg: "L'Amour est rush, la barre de menu dot fermer la page et la router pour prendre effect!",
            status: 0,
        });
    });
}

function getPower(req, res, next) {/* 获取权限 */
    let sql =
        "select * from power;show create table power;select * from menu order by menu.`order`;";// 获取权限
    query(sql, null, next, (reslut) => {
        let mapKey = formatCreateTable(reslut[1][0]["Create Table"]);
        let menu = formatMenu(reslut[2]);
        res.send({ status: 0, data: reslut[0], mapKey, menu });
    });
}

function delMenu(req, res, next) {
    let { key } = req.body;
    if (!key) return res.send({ msg: "error de paramètre", status: 1 });
    let sqls = [
        "delete from menu where `key` = ?",
        "delete from menu where parentKey = ?",
    ];
    let params = [[key], [key]];
    transaction(sqls, params, next)
        .then(() => {
            res.send({
                msg: "Operational est pressie, la barre de menu dot fermer la page et la rouvrir pour prendre effect !",
                status: 0,
            });
        })
        .catch((err) => {
            res.send({ msg: "operational a croup", status: 1 });
        });
}

function getMenuInfo(req, res, next) {
    let { key } = req.query;
    if (!key) return res.send({ msg: "error de paramètre", status: 1 });
    let sql = "select * from menu where `key` = ?";
    query(sql, [key], next, (result) => {
        if (!result || result.length === 0) {
            return res.send({ msg: "Aune information pertinente trouve", status: 0 });
        }
        res.send({ status: 0, data: result[0] });
    });
}

function editMenu(req, res, next) {
    const {
        icon = "",
        key,
        path,
        title,
        parentKey = "",
        keepAlive,
        order,
    } = req.body;
    if (!key || !path || !title || !keepAlive || typeof order === "undefined")
        return res.send({ msg: "error de paramètre", status: 1 });
    let sql =
        "update menu set icon=?,path=?,title=?,parentKey=?,keepAlive=?,`order`=? where `key`=?";
    let params = [icon, path, title, parentKey, keepAlive, order, key];
    query(sql, params, next, () => {
        res.send({
            status: 0,
            msg: "La modification est pressie, la barre de menu dot fermer la page et la rouvrir pour prendre effect!",
        });
    });
}

function countIP(req, res, next) {
    let userInfo = req.user;
    let url = req.url;
    let passUrl = ["/login", "/api/react-ant-admin/login"];
    let passNextUrl = ["/getvisitordata", "/getiplist"];
    if (!userInfo && !passUrl.includes(url)) return next(createError(401));
    if (passNextUrl.includes(url)) return next();

    res.on("finish", () => {
        let time = dayjs().format("YYYY-MM-DD HH:mm:ss");
        let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        ip = ip.match(/\d+\.\d+\.\d+\.\d+/)[0];
        let statusCode = res.statusCode;
        console.log("----------");
        console.log(ip, url, time, statusCode);
        console.log("----------");
        let sql = "insert into statistics values(null,?,?,?,?)";
        let params = [ip, url, time, statusCode];
        query(sql, params, function (err) {
            console.log(err);
        });
    });
    next();
}

function getIP(req, res, next) {
    let { page = 1, pagesize = 10 } = req.query;
    if (page < 1 || pagesize < 1) return res.send({ status: 1, msg: "Erreur de paramètre" });
    let sql =
        'select SQL_CALC_FOUND_ROWS url,DATE_FORMAT(time,"%Y-%m-%d %H:%i:%S") as time,`status`,CONCAT(LEFT(ip,3),".***.***.***") as ip,s_id from statistics limit ?,?;' +
        "select found_rows() as total;" +
        "show create table statistics;";
    let parmas = [(Number(page) - 1) * pagesize, Number(pagesize)];
    query(sql, parmas, next, function (result) {
        let createStr = result[2][0]["Create Table"];
        let mapKey = formatCreateTable(createStr);
        let list = result[0];
        res.send({
            status: 0,
            data: { list, total: result[1][0].total, mapKey },
        });
    });
}

function getUserList(req, res, next) {
    let { page = 1, pagesize = 10, name = "" } = req.query;
    if (Number(page) < 1 || Number(pagesize) < 10)
        return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    let sql =
        "select SQL_CALC_FOUND_ROWS u.*, CONCAT('********','') as pswd ,p.`name` as type_id,p.type_id as t_id from user_info as u LEFT JOIN power as p  ON p.type_id=u.type_id  where username like ? limit ?,?;" +
        "select found_rows() as total;" +
        "show create table user_info;";
    let params = [`%${name}%`, (page - 1) * Number(pagesize), Number(pagesize)];
    query(sql, params, next, (result) => {
        let list = result[0];
        let createStr = result[2][0]["Create Table"];
        let mapKey = formatCreateTable(createStr);
        res.send({ status: 0, data: { list, mapKey }, total: result[1][0].total });
    });
}

function getAllUser(req, res, next) {
  //   let { page = 1, pagesize = 10, name = "", description = "" } = req.query;
  //   if (Number(page) < 1 || Number(pagesize) < 10)
  //       return res.send({ msg: "Erreur de paramètre, veuillez réessayer", status: 1 });
  //   var sql =
  //       `select *, from user_info
  // where name like ? and description like ?  limit ?,?;
  // select found_rows() as total;` + "show create table subscription;";
  //   let params = [
  //       `%${name}%`,
  //       `%${description}%`,
  //       (page - 1) * Number(pagesize),
  //       Number(pagesize),
  //   ];
  //   query(sql, params, next, (datalist) => {
  //
  //       res.send({
  //           status: 0,
  //           data: { list: datalist[0], total: datalist[1][0].total },
  //           msg: "",
  //       });
  //   });
}

function getUserInfo(req, res, next) {
    let { user_id } = req.query;
    if (!user_id) return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    let sql = "select *, CONCAT('','') as pswd from user_info where user_id = ?";
    let params = [user_id];
    query(sql, params, next, (result) => {
        if (!result || result.length === 0) {
            return res.send({ msg: "Information's utilisation insurmountable, veuillez vérifier attentivement", status: 1 });
        }
        res.send({ status: 0, data: result[0] });
    });
}

function getStockInfo(req, res, next) {
    let { stock_id } = req.query;
    if (!stock_id) return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });

    let tables = ['alimentaire'];

    let promises = tables.map((table) => {
        let sql = `SELECT *, CONCAT('', '') AS m_id FROM ${table} WHERE stock_id = ?`;
        let params = [stock_id];
        return new Promise((resolve, reject) => {
            query(sql, params, next, (result) => {
                if (!result || result.length === 0) {
                    resolve(null);
                } else {
                    resolve(result[0]);
                }
            });
        });
    });

    Promise.all(promises)
        .then((results) => {
            let foundResult = results.find((result) => result !== null);
            if (!foundResult) {
                return res.send({ msg: "Information's utilisateur insurmountable, veuillez vérifier attentivement", status: 1 });
            }
            res.send({ status: 0, data: foundResult });
        })
        .catch((error) => {
            console.error(error);
            res.send({ msg: "Une error s'est productive lors de la recherche des information's", status: 1 });
        });
}

function editUser(req, res, next) {
    let { user_id, username, account, pswd, type_id } = req.body;
    if (!user_id || !username || !account || !type_id)
        return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    let modifyPswd = Boolean(pswd);
    let sql = modifyPswd
        ? "update user_info set username = ?, account=?, pswd=?, type_id=? where user_id=? "
        : "update user_info set username = ?, account=?, type_id=? where user_id=?";
    let params = modifyPswd
        ? [username, account, pswd, type_id, user_id]
        : [username, account, type_id, user_id];
    query(sql, params, next, (result) => {
        if (result.affectedRows === 1) {
            return res.send({ status: 0, data: null, msg: "Modified avec success" });
        }
        res.send({ status: 1, msg: "check de la modification, veuillez vérifier les information's de soumission" });
    });
}

function addUser(req, res, next) {
    let { username, account, pswd, type_id } = req.body;
    if (!username || !account || !pswd || !type_id)
        return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    let sql = "insert into user_info values(null,?,?,?,?)";
    let parmas = [username, account, pswd, type_id];
    query(sql, parmas, next, function (result) {
        if (result.affectedRows === 1) {
            return res.send({ status: 0, data: null, msg: "About avec success" });
        }
        res.send({ status: 1, msg: "check de L'Amour des information's utilisateur, veuillez vérifier les information's soumises" });
    });
}

function editType(req, res, next) {
    let { type_id, name, menu_id } = req.body;
    if (!name || !type_id || !Array.isArray(menu_id))
        return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    let sql = "update power set `name`=?,menu_id=? where type_id = ?;";
    let params = [name, menu_id.join(","), type_id];
    query(sql, params, next, (result) => {
        if (result.affectedRows === 1) {
            return res.send({ status: 0, data: null, msg: "Modified avec succès" });
        }
        res.send({ status: 1, msg: "Impossible de modifier les information's d'autorisation, veuillez vérifier les information's de soumission" });
    });
}
function addType(req, res, next) {
    let { name, menu_id } = req.body;
    if (!name || !Array.isArray(menu_id))
        return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    let sql = "insert into power values(null,?,?);";
    let params = [name, menu_id.join(",")];
    query(sql, params, next, (result) => {
        if (result.affectedRows === 1) {
            return res.send({ status: 0, data: null, msg: "About avec succès" });
        }
        res.send({ status: 1, msg: "check de L'Amour des information's d'autorisation, veuillez vérifier les information's de soumission" });
    });
}
function getMenuList(req, res, next) {
    const sql =
        "SELECT  * FROM menu  ORDER BY menu.`order`; " + "show create table menu;";
    query(sql, null, next, (result) => {
        let createStr = result[1][0]["Create Table"];
        let mapKey = formatCreateTable(createStr);
        let data = formatMenu(result[0] || []);
        res.send({ data, mapKey });
    });
}

function register(req, res, next) {
    const { account, pswd, username } = req.body
    if (!account || !pswd || !username) {
        return res.send({ status: 1, msg: "Parameter cannot be empty" })
    }
    const select = "select * from  user_info where username = ? or account = ?"
    query(select, [username, account], next).then(selectRes => {
        if (selectRes.length) {
            return res.send({ status: 1, msg: "Account username already exists! Please change one" })
        }
        const insert = "insert into user_info values(null,?,?,?,2)"
        query(insert, [username, account, pswd], next).then(() => {
            res.send({ status: 0, msg: "The registration is successful, please log in" })
        })
    })
}

module.exports = {
    login,
    getMenu,
    addMenu,
    getPower,
    delMenu,
    getMenuInfo,
    editMenu,
    getIP,
    getAllUser,

    getUserList,
    getUserInfo,
    editUser,
    addUser,
    editType,
    addType,
    getMenuList,
    register
};
