export function throttle(func, interval = 100) {
  let sign = true
  return function () {
    if (!sign) return
    console.log('run')
    sign = false
    setTimeout(() => {
      func.apply(this, arguments)
      sign = true
    }, interval)
  }
}
export function debounce(func, interval = 100) {
  var timer = ''
  return function () {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, arguments)
    }, interval)
  }
}

Date.prototype.format = function (fmt) {
  var arr_week = new Array('星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六')
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
    W: arr_week[this.getDay()]
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}
