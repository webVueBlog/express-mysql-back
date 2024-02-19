const { query, transaction } = require("../common/mysql");
const { formatCreateTable } = require("../utils");
const dayjs = require("dayjs");

// service
function addService(req, res, next) {
    let userInfo = req.user;
    let sql;
    const { name, price, type, date, totalPlace, description, content } = req.body;
    if (type === 'event') {
        console.log("aaaa")
        sql = "insert into event values(null,?,?,?,?,?,?,?,?,?,?)";
    } else if (type === 'subscription') {
        sql = "insert into subscription values(null,?,?,?,?,?,?,?,?)";
    } else if (type === 'workshop') {
        sql = "insert into workshop values(null,?,?,?,?,?,?,?,?,?,?)";
    } else if (type === 'course') {
        sql = "insert into course values(null,?,?,?,?,?,?,?,?,?,?)";
    } else if (type === 'reservation') {
        sql = "insert into reservation values(null,?,?,?,?,?,?,?,?,?,?)";
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
        totalPlace,
        0,
    ];
    query(sql, params, next).then((result) => {
        let m_id = result.insertId;
        let sql = "insert into join_service values(null,?,?,?,?,?,?,?,?,?,?,?)";
        let params = [
            m_id,
            name,
            price,
            type,
            dayjs(date).format("YYYY-MM-DD HH:mm"),
            description,
            content,
            userInfo.username,
            dayjs().format("YYYY-MM-DD HH:mm"),
            totalPlace,
            0,
        ]
        query(sql, params, next).then(() => {
            res.send({ msg: "Is Added!", status: 0 }
            )});
    });
}
function joinService(req, res, next) {
    let userInfo = req.user;

    const { type, m_id } = req.body;
    if (!type || !m_id || !userInfo) {
        return res.send({ msg: 'Parameters cannot be empty!', status: 1 });
    }
    let sql = "select * from join_order where user_id = ? and m_id = ? and type = ?"
    query(sql, [userInfo.user_id, m_id, type.toLowerCase()], next).then((sqlRes) => {
        if (sqlRes.length !== 0) {
            return res.send({ msg: 'Already Joined！', status: 1 });
        }
        const deal = () => {
            let isSubscription = type === "subscription"
            let sqls = [
                "insert into join_order values(null,?,?,?, now())",
                `update ${type.toLowerCase()} set bookedPlace = bookedPlace +1 where m_id = ?`
            ]
            let params = [
                [m_id, userInfo.user_id, type.toLowerCase()],
                [m_id]
            ]
            if (isSubscription) {
                sqls.pop()
                params.pop()
            }
            // mysql 事务处理
            transaction(sqls, params, next).then(() => {
                res.send({ msg: 'Joined successful！', status: 0 });
            })
        }
        if (type === "subscription") {
            return deal()
        }
        let select = `select * from ${type.toLowerCase()} where totalPlace > bookedPlace and m_id = ?`
        query(select, [m_id], next).then(selectRes => {
            if (selectRes.length === 0) {
                return res.send({ msg:'Sorry, already full！', status: 1 });
            }
            deal()
        })
    })
}
function isJoined(req, res, next) {
    let userInfo = req.user;

    const { type, m_id } = req.body;
    if (!type || !m_id || !userInfo) {
        return res.send({ msg: 'Parameters cannot be empty!', status: 1 });
    }
    console.log(type);
    let sql = "select * from join_order where user_id = ? and m_id = ? and type = ?"
    query(sql, [userInfo.user_id, m_id, type.toLowerCase()], next).then((sqlRes) => {
        if (sqlRes.length !== 0) {
            res.send({ data:true | false })
        }
    })
}

function addOrder(req, res, next) {
    let userInfo = req.user;
    let sql = "insert into event values(null,?,?,?,?,?,?,?,?,?,?,?)";
    const { m_id, name, price, type, date, totalPlace, description, content } = req.body;

    let params = [
        m_id,
        name,
        price,
        type,
        dayjs(date).format("YYYY-MM-DD HH:mm"),
        description,
        content,
        userInfo.username,
        dayjs().format("YYYY-MM-DD HH:mm"),
        totalPlace,
        0,
    ];
    query(sql, params, next).then(() => res.send({ msg: "L'Amour est rush", status: 0 }))
}

function getServiceByUserId(req, res, next) {
    let userInfo = req.user;
    console.log(userInfo, "000000userInfo.id")
    const sql =
        `SELECT *, DATE_FORMAT(add_time, "%Y-%m-%d %H:%i:%S") as add_time 
        FROM join_order WHERE user_id = ?;
    SELECT FOUND_ROWS() AS total;`;
    const params = [userInfo.user_id];
    query(sql, params, next, (datalist) => {
        res.send({
            status: 0,
            data: { event: datalist[0], total: datalist[1][0].total },
            msg: '',
        });
    });
}
function getServiceByIdAndType(req, res, next) {
    const { type } = req.params;
    let { order_id } = req.query
    const userInfo = req.user
    if (!userInfo) {
        return res.status(401).send({ status: 0, msg: "please login" })
    }
    if (!order_id || !type) {
        return res.send({ status: 0, msg: "parameters can't be null" })
    }
    order_id = JSON.parse(order_id)
    console.log(order_id, "m_id.id")
    const sql =
        `select o.*, s.bookedPlace,s.content,s.creator,s.date,s.description,s.name,s.price,s.totalPlace from join_order o LEFT JOIN join_service s on o.m_id = s.m_id and o.type = s.type where o.user_id = ?  and o.type = ?  and o.order_id in (${order_id.join(",")});`
    let params = [userInfo.user_id, type];
    console.log(sql,params);
    query(sql, params, next, (datalist) => {
        res.send({
            status: 0,
            data: { event: datalist },
            msg: '',
        });
    });
}

function delUser(req, res, next){
    let { user_id } = req.params;
    let sql = "delete from user_info where `user_id` = ?";

    // Execute the SQL delete statement
    query(sql, [user_id], next,() => {
        res.send({ msg: 'Delete successful', status: 0 });
    });

    let sql_order = "delete from join_order where `user_id` = ?";
    query(sql_order, [user_id], next,() => {
        res.send({ msg: 'Delete successful', status: 0 });
    });
}


function getAllUserService(req, res, next) {
    let { page = 1, pagesize = 10, name = "", description = "" } = req.query;
    if (Number(page) < 1 || Number(pagesize) < 10)
        return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    const sql =
        `select SQL_CALC_FOUND_ROWS *,DATE_FORMAT(add_time,"%Y-%m-%d %H:%i:%S") as add_time from join_order 
  limit ?,?;
  select found_rows() as total;` + "show create table join_order;";
    let params = [
        (page - 1) * Number(pagesize),
        Number(pagesize),
    ];
    query(sql, params, next, (datalist) => {
        let createStr = datalist[2][0]["Create Table"];
        let mapKey = formatCreateTable(createStr);
        res.send({
            status: 0,
            data: { list: datalist[0], mapKey, total: datalist[1][0].total },
            msg: "",
        });
    });
}

function delUserService(req, res, next) {
    let { order_id } = req.params;
    let sql = "delete from join_order where `order_id` = ?";

    // Execute the SQL delete statement
    query(sql, [order_id], next,() => {
        res.send({ msg: 'Delete successful', status: 0 });
    });
}

// subscription
function getSubscription(req, res, next) {
    let { page = 1, pagesize = 10, name = "", description = "" } = req.query;
    if (Number(page) < 1 || Number(pagesize) < 10)
        return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    var sql =
        `select SQL_CALC_FOUND_ROWS *,DATE_FORMAT(add_time,"%Y-%m-%d %H:%i:%S") as add_time from subscription 
  where name like ? and description like ?  limit ?,?;
  select found_rows() as total;` + "show create table subscription;";
    let params = [
        `%${name}%`,
        `%${description}%`,
        (page - 1) * Number(pagesize),
        Number(pagesize),
    ];
    query(sql, params, next, (datalist) => {

        res.send({
            status: 0,
            data: { list: datalist[0], total: datalist[1][0].total },
            msg: "",
        });
    });
}
function getSubscriptionById(req, res, next) {
    const { m_id } = req.params; // Assuming the m_id is provided as a URL parameter
    console.log(m_id, 'm_id');
    if (!m_id) {
        return res.status(400).send({ msg: 'Missing m_id parameter', status: 1 });
    }
    const sql =
        `SELECT *, DATE_FORMAT(add_time, "%Y-%m-%d %H:%i:%S") as add_time 
        FROM subscription WHERE m_id = ?;
    SELECT FOUND_ROWS() AS total;
    `;
    const params = [m_id];
    query(sql, params, next, (datalist) => {
        res.send({
            status: 0,
            data: { event: datalist[0][0], total: datalist[1][0].total },
            msg: '',
        });
    });
}

// event
function getEvent(req, res, next) {
    let { page = 1, pagesize = 10 } = req.query;
    if (Number(page) < 1 || Number(pagesize) < 10)
        return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    const sql =
        `select SQL_CALC_FOUND_ROWS *,DATE_FORMAT(add_time,"%Y-%m-%d %H:%i:%S") as add_time from event 
limit ?,?;
  select found_rows() as total;`;
    let params = [
        (page - 1) * Number(pagesize),
        Number(pagesize),
    ];
    query(sql, params, next, (datalist) => {
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
    SELECT FOUND_ROWS() AS total;
    `;
    const params = [m_id];
    query(sql, params, next, (datalist) => {
        if (datalist[0].length === 0) {
            return res.status(404).send({ msg: 'Event not found', status: 1 });
        }

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
        return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    const sql =
        `select SQL_CALC_FOUND_ROWS *,DATE_FORMAT(add_time,"%Y-%m-%d %H:%i:%S") as add_time from workshop 
limit ?,?;
  select found_rows() as total;` + "show create table workshop;";
    let params = [
        (page - 1) * Number(pagesize),
        Number(pagesize),
    ];
    query(sql, params, next, (datalist) => {
        res.send({
            status: 0,
            data: { list: datalist[0], total: datalist[1][0].total },
            msg: "",
        });
    });
}
function getWorkshopById(req, res, next) {
    const { m_id } = req.params; // Assuming the m_id is provided as a URL parameter
    console.log(m_id, 'm_id');
    if (!m_id) {
        return res.status(400).send({ msg: 'Missing m_id parameter', status: 1 });
    }
    const sql =
        `SELECT *, DATE_FORMAT(add_time, "%Y-%m-%d %H:%i:%S") as add_time 
        FROM workshop WHERE m_id = ?;
    SELECT FOUND_ROWS() AS total;
    `;
    const params = [m_id];
    query(sql, params, next, (datalist) => {
        if (datalist[0].length === 0) {
            return res.status(404).send({ msg: 'Event not found', status: 1 });
        }

        res.send({
            status: 0,
            data: { event: datalist[0][0],  total: datalist[1][0].total },
            msg: '',
        });
    });
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
        res.send({
            status: 0,
            data: { list: datalist[0],  total: datalist[1][0].total },
            msg: "",
        });
    });
}
function getCourseById(req, res, next) {
    const { m_id } = req.params; // Assuming the m_id is provided as a URL parameter
    console.log(m_id, 'm_id');
    if (!m_id) {
        return res.status(400).send({ msg: 'Missing m_id parameter', status: 1 });
    }
    const sql =
        `SELECT *, DATE_FORMAT(add_time, "%Y-%m-%d %H:%i:%S") as add_time 
        FROM course WHERE m_id = ?;
    SELECT FOUND_ROWS() AS total;
    `;
    const params = [m_id];
    query(sql, params, next, (datalist) => {
        if (datalist[0].length === 0) {
            return res.status(404).send({ msg: 'Event not found', status: 1 });
        }
        res.send({
            status: 0,
            data: { event: datalist[0][0], total: datalist[1][0].total },
            msg: '',
        });
    });
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

        let mapKey = formatCreateTable(createStr);
        res.send({
            status: 0,
            data: { list: datalist[0], mapKey, total: datalist[1][0].total },
            msg: "",
        });
    });
}
function getReservationById(req, res, next) {
    const { m_id } = req.params; // Assuming the m_id is provided as a URL parameter
    if (!m_id) {
        return res.status(400).send({ msg: 'Missing m_id parameter', status: 1 });
    }
    const sql =
        `SELECT *, DATE_FORMAT(add_time, "%Y-%m-%d %H:%i:%S") as add_time 
        FROM reservation WHERE m_id = ?;
    SELECT FOUND_ROWS() AS total;
    `;
    const params = [m_id];
    query(sql, params, next, (datalist) => {
        if (datalist[0].length === 0) {
            return res.status(404).send({ msg: 'Event not found', status: 1 });
        }

        res.send({
            status: 0,
            data: { event: datalist[0][0], total: datalist[1][0].total },
            msg: '',
        });
    });
}

module.exports = {
    addService,
    joinService,
    getServiceByIdAndType,
    isJoined,
    delUserService,
    addOrder,
    delUser,

    getAllUserService,
    getEventById,
    getSubscription,
    getEvent,
    getWorkshop,
    getCourse,
    getReservation,
    getSubscriptionById,
    getWorkshopById,
    getCourseById,
    getReservationById,
    getServiceByUserId,
}
