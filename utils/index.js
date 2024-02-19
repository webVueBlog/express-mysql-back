const dayjs = require("dayjs");// 引入dayjs库
function formatMenu(list) {// 假设list是原始菜单数据
  // 遍历原始菜单数据
  if (Array.isArray(list)) {// 判断list是否为数组
    const obj = {};// 创建一个空对象
    const newArr = [];// 创建一个新数组
    list.forEach((item) => {// 遍历原始菜单数据
      const { key, parentKey } = item;// 解构item中的key和parentKey，key示例list
      if (!obj[key]) {// 如果obj中没有key
        obj[key] = item;// 将item添加到obj中
      } else {
        item.children = obj[key].children;// 如果obj中有key，将item的children属性设置为obj中key的children属性
        obj[key] = item;// 更新obj中key的值
      }
      if (parentKey) {// 如果parentKey存在
        // 如果obj中没有parentKey，则创建一个包含children属性的对象，并将obj[key]添加到children数组中
        if (!obj[parentKey]) obj[parentKey] = { children: [obj[key]] };
        // 如果obj[parentKey]没有children属性，则创建一个children属性并添加obj[key]
        else if (!obj[parentKey].children) obj[parentKey].children = [obj[key]];
        else obj[parentKey].children.push(obj[key]);// 否则，将obj[key]添加到children数组中
      }
      if (!obj[key]["parentKey"]) {// 如果obj[key]没有parentKey属性，则添加一个空数组
        newArr.push(obj[key]);// 将obj[key]添加到新数组中
      }
    });
    return newArr;// 返回新数组，即符合要求的菜单数据
  }
  return [];// 如果list不是数组，则返回空数组
}

function formatCreateTable(str) {// 假设str是原始建表语句
  // 实现格式化逻辑
  let arr = str.split(/\n/);// 以换行符分割字符串
  // 匹配以空格开头的字符串，包括空格，`(.*?)`是第一个分组，(.*?)是第二个分组，(.*?)是第三个分组
  let Reg = /^\s+`(.*?)`(.*?)COMMENT\s+'(.*?)'/g;
  let mapKey = [];// 用于存储匹配结果的数组
  arr.forEach((item) => {// 遍历数组中的每一项
    let res = Reg.exec(item);// 执行正则表达式匹配
    if (res) {// 如果匹配成功
      mapKey.push({
        title: res[3],
        dataIndex: res[1],
        key: res[1],
      });// 添加匹配结果到mapKey数组中
      Reg.lastIndex = 0;// 重置正则表达式的lastIndex属性
    }
  });
  return mapKey;
}

function getVistor(list) {// 假设list是包含访问者信息的数组
  const todayTime = dayjs().format("YYYY-MM-DD");// 获取当前日期
  let today = {};// 用于存储当天访问者的对象
  let times = [];// 用于存储所有日期的时间戳的数组
  let visto_times = {};// 用于存储所有日期访问者信息的对象
  let data = {};// 用于存储最终结果的对象
  let iptime = {};// 用于存储访问者IP和访问时间的对象
  list.forEach((item) => {// 遍历数组中的每一项
    let day = dayjs(item.time).format("YYYY-MM-DD");// 获取访问日期
    if (iptime[day]) {// 如果对象中存在该日期
      iptime[day].push(item.ip);// 将IP添加到该日期的数组中
    } else {
      iptime[day] = [item.ip];// 如果不存在，则创建一个数组
    }
    if (!times.includes(day)) {// 如果数组中不存在该日期
      times.push(day);// 将日期添加到数组中
      visto_times[day] = 1;// 创建一个访问者信息的对象，并将访问次数设置为1
    } else {// 如果存在，则将访问次数加1
      visto_times[day] += 1;// 创建一个访问者信息的对象，并将访问次数加1
    }
  });
  data.deal = Object.keys(visto_times).map((day) => {// 遍历所有日期
    if (day === todayTime) {// 如果当前日期等于今天
      today.deal = visto_times[day];// 将今天的访问次数存储到today对象中
    }
    return {
      time: day,// 返回日期作为时间
      value: visto_times[day],// 返回访问次数作为值
    };
  });
  data.ips = Object.keys(iptime).map((day) => {// 遍历所有日期
    let value = Array.from(new Set(iptime[day])).length;// 获取去重后的IP数量
    if (day === todayTime) {// 如果当前日期等于今天
      today.ips = value;// 将今天的IP数量存储到today对象中
    }
    return { time: day, value };// 返回日期作为时间，IP数量作为值
  });
  data.today = today;// 将今天的访问者信息和IP数量存储到data对象中
  return data;// 返回data对象
}

module.exports = {
  formatMenu,// 格式化菜单数据
  formatCreateTable,// 格式化创建表语句
  getVistor,// 获取访问者信息
};
