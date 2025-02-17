import './assets/main.css'
import router from './util/router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import WrapElLoading from './plugins/elLoading'
import './util/indexDb.js'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.use(WrapElLoading)
app.mount('#app')
