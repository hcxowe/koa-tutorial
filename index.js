const Koa = require('koa')
const route = require('koa-route')
const static = require('koa-static')
const compose = require('koa-compose')

const fs = require('fs')
const path = require('path')

const app = new Koa()


const main = ctx => {
    console.log('main')
    ctx.response.type = 'html'
    ctx.response.body = fs.createReadStream('./template/index.html')
}

const about = ctx => {
    console.log('about')
    ctx.response.type = 'html'
    ctx.response.body = fs.createReadStream('./template/about.html')
}

const redirect = ctx => {
    ctx.response.redirect('/')
}

const logger = async (ctx, next) => {
    console.log(`logger: ${Date.now()} ${ctx.request.method} ${ctx.request.url}`)

    await next()

    console.log('logger end')
}

const error = async ctx => {

    //ctx.throw(500, 'server is error')

    //ctx.response.status = 500
    //ctx.response.body = 'server is error'

    throw new Error('boom boom')
}

const notFound = async (ctx, next) => {
    //ctx.throw(404)

    ctx.response.status = 404
    ctx.response.body = 'Page Not Found'

    next()
}

const handler = async (ctx, next) => {
    try {
        await next()
    }
    catch (err) {
        ctx.status = 500
        ctx.type = 'html'
        ctx.body = '<p>Something error is appended.</p>'

        ctx.app.emit('error', err, ctx);
    }
}

app.use(static(path.join(__dirname, 'assets')))

app.use(handler)
app.use(logger)
app.use(route.get('/', main))
app.use(route.get('/index', main))
app.use(route.get('/about', about))
app.use(route.get('/redirect', redirect))
app.use(route.get('/error', error))
app.use(notFound)

app.on('error', (err, ctx) =>
    console.error('server error', err)
)

app.listen(3000)