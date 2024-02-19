const { query } = require("../common/mysql");
const config = require("../common");
const path = require("path")
const publicPath = path.resolve(process.cwd(), "./public")
const formidable = require('formidable');// 引入formidable模块，作用是处理表单及文件上传
const fs = require('fs');
function getPost(req, res, next) {
    let { page = 1, pagesize = 10 } = req.query;
    if (Number(page) < 1 || Number(pagesize) < 10)
        return res.send({ msg: "error de paramètre, veuillez réessayer", status: 1 });
    const sql =
        `select SQL_CALC_FOUND_ROWS *,DATE_FORMAT(add_time,"%Y-%m-%d %H:%i:%S") as add_time from post
limit ?,?;
  select found_rows() as total;` + "show create post event;";
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
function addPost(req, res, next) {
    let userInfo = req.user;
    let sql;
    const { name, price, type, date, description, content } = req.body;

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
function editPost(req, res, next) {
    let { id } = req.body;
    if (!id)
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
function delPost(req, res) {
    let { id } = req.body;
    if (!key) return res.send({ msg: "error de paramètre", status: 1 });

    let sql = "delete from post where `m_id` = ?";

    // Execute the SQL delete statement
    query(sql, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send({ msg: 'Database error', status: 1 });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ msg: 'No rows deleted', status: 1 });
        }

        res.send({ msg: 'Delete successful', status: 0 });
    });
}


/**
 * 获取随机数
 */
function getRandom() {
    return Math.random().toString(36).slice(-3)
}

/**
 * 给文件名加后缀，如 a.png 转换为 a-123123.png
 * @param {string} fileName 文件名
 */
function genRandomFileName(fileName = '') {
    // 如 fileName === 'a.123.png'

    const r = getRandom()
    if (!fileName) return r

    const length = fileName.length // 9
    const pointLastIndexOf = fileName.lastIndexOf('.') // 5
    if (pointLastIndexOf < 0) return `${fileName}-${r}`

    const fileNameWithOutExt = fileName.slice(0, pointLastIndexOf) // "a.123"
    const ext = fileName.slice(pointLastIndexOf + 1, length) // "png"
    return `${fileNameWithOutExt}-${r}.${ext}`
}

function uploadImg(req, res, next) {
    const oldPath = path.resolve(publicPath, "./temp")
    const newPath = path.resolve(publicPath, "./img")
    // 检测文件夹 创建文件夹
    if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath)
    }
    if (!fs.existsSync(oldPath)) {
        fs.mkdirSync(oldPath)
    }
    if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath)
    }
    const form = formidable({ multiples: true, uploadDir: oldPath });
    form.parse(req, (err, fields, files) => {
        let postImg = files.postImg
        console.log(files);
        if (!postImg) {
            return res.send({
                "errno": 1, // 注意：值是数字，不能是字符串
                "message": "未检测到文件上传"
            })
        }
        let fileName = genRandomFileName(postImg.name)

        let pos = path.join(newPath, fileName)
        fs.renameSync(postImg.path, pos)
        res.send({
            "errno": 0, // 注意：值是数字，不能是字符串
            "data": {
                "url": `http://127.0.0.1:${config.port}/img/${fileName}`, // 图片 src ，必须
                "alt": fileName, // 图片描述文字，非必须
                "href": "" // 图片的链接，非必须
            }
        })
    })
}
module.exports = {
    getPost,
    addPost,
    editPost,
    delPost,
    uploadImg
}
