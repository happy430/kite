const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const { createBundleRenderer } = require('vue-server-renderer')

// 缓存
const microCache = new LRU({
  max: 100,
  maxAge: 1000 * 60 // 重要提示：条目在 1 秒后过期。
})

const isCacheable = ctx => {
  // 实现逻辑为，检查请求是否是用户特定(user-specific)。
  // 只有非用户特定(non-user-specific)页面才会缓存
  // 暂时未用到
  console.log(ctx.url)
  if (ctx.url === '/kite-test-cacheable') {
    return true
  }
  return false
}

let renderer
const templatePath = path.resolve(__dirname, '../public/index.template.html')
// 第 2步：根据环境变量生成不同BundleRenderer实例

// 获取客户端、服务器端打包生成的json文件
const serverBundle = require('../../static/_client/vue-ssr-server-bundle.json')
const clientManifest = require('../../static/_client/vue-ssr-client-manifest.json')
// 赋值
renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template: fs.readFileSync(templatePath, 'utf-8'),
  clientManifest
})

const render = async (ctx, next) => {
  ctx.set('Content-Type', 'text/html')

  let accessToken = ctx.cookies.get('accessToken')

  const handleError = err => {
    if (err.code === 404) {
      const html = fs.readFileSync(
        path.resolve(__dirname, '../../views/404.html'),
        'utf-8'
      )
      ctx.status = 404
      ctx.body = html
    } else {
      ctx.status = 500
      ctx.body = '500 Internal Server Error'
      console.error(`error during render : ${ctx.url}`)
      console.error(err.stack)
    }
  }

  const context = {
    url: ctx.url,
    accessToken: accessToken
  }

  // 判断是否可缓存，可缓存并且缓存中有则直接返回
  const cacheable = isCacheable(ctx)
  if (cacheable) {
    const hit = microCache.get(ctx.url)
    if (hit) {
      console.log('从缓存中取', hit)
      return (ctx.body = hit)
    }
  }

  try {
    const html = await renderer.renderToString(context)
    ctx.body = html
    if (cacheable) {
      console.log('设置缓存: ', ctx.url)
      microCache.set(ctx.url, html)
    }
  } catch (error) {
    handleError(error)
  }
}

module.exports = render
