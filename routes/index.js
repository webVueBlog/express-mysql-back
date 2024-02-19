const express = require("express");
const router = express.Router();//  引入路由
const reactAdmin = require("../module");// 引入admin路由
const reactService = require("../module/service");// 引入service路由
const reactPost = require("../module/postWall");// 引入post路由

// service
router.post("/addService", reactService.addService);// 新增服務
router.post("/joinService", reactService.joinService);// 加入服務
router.post("/addOrder", reactService.addOrder);// 新增訂單
router.get("/getServiceByUserId", reactService.getServiceByUserId);// 取得服務列表
router.get("/getServiceByIdAndType/:type/", reactService.getServiceByIdAndType);// 取得服務列表
router.get("/isJoined", reactService.isJoined);// 判斷是否加入服務
router.get("/getAllUserService", reactService.getAllUserService);// 取得所有服務
router.delete("/delUserService/:order_id", reactService.delUserService);// 刪除服務

router.get("/getEvent", reactService.getEvent);// 取得活動列表
router.get("/getWorkshop", reactService.getWorkshop);// 取得工作坊列表
router.get("/getSubscription", reactService.getSubscription);// 取得訂閱列表
router.get("/getCourse", reactService.getCourse);// 取得課程列表
router.get("/getReservation", reactService.getReservation);// 取得預約列表

router.get("/getEventById/:m_id", reactService.getEventById);// 取得活動列表
router.get("/getWorkshopById/:m_id", reactService.getWorkshopById);// 取得工作坊列表
router.get("/getSubscriptionById/:m_id", reactService.getSubscriptionById);// 取得訂閱列表
router.get("/getCourseById/:m_id", reactService.getCourseById);// 取得課程列表
router.get("/getReservationById/:m_id", reactService.getReservationById);// 取得預約列表

router.delete("/delUser/:user_id", reactService.delUser);// 刪除會員

// post
router.post("/addPost", reactPost.addPost);// 新增貼文
router.get("/getPost", reactPost.getPost);// 取得貼文列表
router.post("/delPost", reactPost.delPost);// 刪除貼文
router.post("/post-upload-img", reactPost.uploadImg);// 上傳圖片

// others
router.post("/login", reactAdmin.login);// 登入
router.post("/register",reactAdmin.register)// 註冊
router.get("/getmenu", reactAdmin.getMenu);// 取得菜單列表
router.get("/getmenulist", reactAdmin.getMenuList);// 取得菜單列表
router.post("/addmenu", reactAdmin.addMenu);// 新增菜單
router.get("/getpower", reactAdmin.getPower);// 取得權限列表
router.post("/delmenu", reactAdmin.delMenu);// 刪除菜單
router.get("/getmenuinfo", reactAdmin.getMenuInfo);// 取得菜單信息
router.post("/editmenuinfo", reactAdmin.editMenu);// 修改菜單信息
router.get("/getiplist", reactAdmin.getIP);// 取得IP列表
router.get("/getuserlist", reactAdmin.getUserList);// 取得會員列表
router.get("/getuserinfo", reactAdmin.getUserInfo);// 取得會員信息
router.post("/edituserinfo", reactAdmin.editUser);// 修改會員信息
router.post("/adduserinfo", reactAdmin.addUser);// 新增會員信息
router.post("/edittype", reactAdmin.editType);// 修改菜單類型
router.post("/addtype", reactAdmin.addType);// 新增菜單類型

router.get("/getAllUser", reactAdmin.getAllUser);// 取得所有會員
module.exports = router;
