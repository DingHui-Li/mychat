import { createWebHashHistory, createRouter, RouteRecordRaw } from 'vue-router'

const pages = import.meta.glob('../pages/**/**.vue')
const routes: Array<RouteRecordRaw> = []
Object.keys(pages).map(function (key: string) {
  const component = pages[key]
  const path = key
    .toLowerCase()
    .replace(/\.vue$/, '')
    .replace(/.+\/pages/g, '')
  if (!path.includes('/components')) {
    routes.push({
      path,
      name: path,
      component
    })
  }
})

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/launch'
    },
    ...routes
  ]
})
