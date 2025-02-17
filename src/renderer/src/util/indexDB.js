var request = window.indexedDB.open('MyWeChat', 1)
var db
const tables = ['AI-analy', 'AI-suggest']

request.onerror = function (err) {
  console.log('indexDB打开失败:', err)
}
request.onsuccess = function (event) {
  db = request.result
  console.log('indexDB打开成功')
}
request.onupgradeneeded = function (event) {
  db = request.result
  //建表
  tables.forEach((table) => {
    if (!db.objectStoreNames.contains(table)) {
      db.createObjectStore(table, { keyPath: 'userName' })
    }
  })
}

export function add(tb = '', data = {}) {
  return new Promise((resolve, reject) => {
    if (!tb) {
      return reject('表名不能为空')
    }
    if (!data?.userName) {
      return reject('userName不能为空')
    }
    var request = db
      .transaction([tb], 'readwrite') //新建事务，readwrite, readonly(默认), versionchange
      .objectStore(tb) //拿到IDBObjectStore 对象
      .add(data)
    request.onsuccess = function (event) {
      resolve(event)
    }
    request.onerror = function (err) {
      reject(err)
    }
    request.onabort = function (err) {
      reject(err)
    }
  })
}

export function remove(tb = '', id = '') {
  return new Promise((resolve, reject) => {
    if (!tb) {
      return reject('表名不能为空')
    }
    if (!id) {
      return reject('id不能为空')
    }
    var request = db.transaction([tb], 'readwrite').objectStore(tb).delete(id)
    request.onsuccess = function (event) {
      resolve(event)
    }
    request.onerror = function (err) {
      reject(err)
    }
  })
}

export function readAll(tb = '') {
  return new Promise((resolve, reject) => {
    if (!tb) {
      return reject('表名不能为空')
    }
    var objectStore = db.transaction([tb]).objectStore(tb)
    let list = []
    objectStore.openCursor().onsuccess = function (event) {
      var cursor = event.target.result
      if (cursor) {
        list.push(cursor.value)
        cursor.continue()
      } else {
        resolve(list)
      }
    }
  })
}

export function read(tb, id) {
  return new Promise((resolve, reject) => {
    var request = db.transaction([tb]).objectStore(tb).get(id)
    request.onsuccess = function (event) {
      resolve(request.result)
    }
    request.onerror = function (event) {
      reject()
    }
  })
}

export function update(tb = '', data = {}) {
  return new Promise(async (resolve, reject) => {
    if (!tb) {
      return reject('表名不能为空')
    }
    let t = await read(tb, data.userName)
    if (t) {
      var request = db
        .transaction([tb], 'readwrite')
        .objectStore(tb)
        .put({ ...t, ...data })
      request.onsuccess = function (event) {
        resolve(event)
      }
      request.onerror = function (err) {
        reject(err)
      }
    } else {
      add(tb, data)
        .then((res) => resolve(res))
        .catch((err) => reject(err))
    }
  })
}

export function clear() {
  tables.forEach((table) => {
    clearIndexedDB(table)
  })
}

function clearIndexedDB(databaseName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName)

    request.onsuccess = () => {
      console.log(`IndexedDB "${databaseName}" deleted successfully.`)
      resolve()
    }

    request.onerror = (event) => {
      console.error(`Error deleting IndexedDB "${databaseName}".`, event)
      reject(event)
    }

    request.onblocked = () => {
      console.warn(`Deletion of IndexedDB "${databaseName}" is blocked.`)
    }
  })
}
