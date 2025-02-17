import { ElLoading } from 'element-plus'

/**
 * @description 扩展ElLoading,传入默认值
 */
export default {
  install(app: any) {
    const svg: string = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_OSmW{transform-origin:center;animation:spinner_T6mA .75s step-end infinite}@keyframes spinner_T6mA{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}100%{transform:rotate(360deg)}}</style><g class="spinner_OSmW"><rect x="11" y="1" width="2" height="5" opacity=".14"/><rect x="11" y="1" width="2" height="5" transform="rotate(30 12 12)" opacity=".29"/><rect x="11" y="1" width="2" height="5" transform="rotate(60 12 12)" opacity=".43"/><rect x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity=".57"/><rect x="11" y="1" width="2" height="5" transform="rotate(120 12 12)" opacity=".71"/><rect x="11" y="1" width="2" height="5" transform="rotate(150 12 12)" opacity=".86"/><rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)"/></g></svg>`
    const loadingDir: any = ElLoading.directive
    const originDirMounted = loadingDir.mounted
    loadingDir.mounted = function (el: any, binding: any, vnode: any, prevVnode: any) {
      // 需要覆盖哪些默认属性值在这里设置，具体属性名参考官网loading指令用法
      el.setAttribute('element-loading-svg', svg)
      el.setAttribute('element-loading-svg-view-box', '0 0 24 24')
      originDirMounted.call(this, el, binding, vnode, prevVnode)
    }
    const originService = ElLoading.service
    ElLoading.service = function (options: any = {}) {
      return originService.call(this, Object.assign({ svg }, options))
    }
    app.config.globalProperties.$loading = ElLoading.service
    // 如果在main.ts中全局使用了ElementPlus —> app.use(ElementPlus),则下面这行代码不需要
    // app.use(ElLoading);
  }
}
