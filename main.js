const express = require('express')
const { Server: HttpServer, request } = require('http')
const { Server: IOServer } = require('socket.io')

let app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)
const PORT = 8080
//----------------------------------------
// ATENCION! Cambiar esta constante para utilizar los distintos motores
//----------------------------------------
const { engine } = require('ejs')

// definimos el motor de plantillas a utilizar
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('./public'))

app.set('views', './views')
app.set('view engine', 'ejs')

const { Router } = express //Esto es igual a const Router = express.Router
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets/images/productos')
    },
    filename: (req, file, cb) => {
        //Para usar el nombre original
        //cb(null, `${Date.now()}-${file.originalname}.jpg`) 
        cb(null, `${file.fieldname}-${Date.now()}.jpg`)
    }
})

const upload = multer({ storage })

const Producto = require(__dirname+'/product')

const productRouter = Router()

app.get('/', (request, response) => {
    console.log('GET request recibido index')

    const resp_data = {
        page_title:'Nuevo Producto',
        success_action: '',
        success: 0,
        productos : Producto.ar_objetos
    }

    console.log({resp_data})
    return response.render('index', resp_data)
})

//No hace falta indicar el prefijo pq se lo indicamos mas abajo en el use
productRouter.get('', (request, response, next) => {
    console.log('GET request recibido')
    const productos = Producto.ar_objetos

    const resp_data = {
        productos: productos,
        page_title: 'Listado de Productos'
    }

    return response.status(201).render('list_products', resp_data)
})

productRouter.get('/:id', (request, response, next) => {
    console.log('GET request recibido')
    const id = Number.parseInt(request.params.id)
    let product = Producto.getById(id)
    if(!product){
        return response.status(404).json({
            error: "producto no encontrado"
        })
    }
    return response.status(201).json(product)
})

productRouter.post('', upload.single('thumbnail'), (request, response, next) => {
    console.log('POST request recibido')
    let product = new Producto(request.body.title, request.body.price, '')

    const file = request.file
    //console.log({file})
    if(file) product.thumbnail = 'assets/images/productos/'+file.filename
    //console.log({file: request.file})
    
    product = Producto.create(product)
    
    const resp_data = {
        page_title:'Nuevo Producto',
        success: 1,
        success_action: 'guardar',
        productos : Producto.ar_objetos
    }

    //Satus 201 para decir que el registro se creo exitosamente
    return response.status(201).render('index', resp_data)
})

productRouter.put('/:id', upload.single('thumbnail'), (request, response, next) => {
    console.log('PUT request recibido')
    const id = Number.parseInt(request.params.id)
    let product = Producto.getById(id)
    if(product === null) return response.status(404).json({
        error: "producto no encontrado"
    })

    const file = request.file
    if(file) product.thumbnail = 'assets/images/productos/'+file.filename

    product.title = request.body.title
    product.price = request.body.price
    Producto.update(product)

    const resp_data = {
        page_title:'Nuevo Producto',
        success: 1,
        success_action: 'guardar'
    }
    //Satus 201 para decir que el registro se creo exitosamente
    return response.status(201).render('index', resp_data)
})

productRouter.delete('/:id', (request, response, next) => {
    console.log('DELETE request recibido')
    const id = Number.parseInt(request.params.id)
    let product = Producto.getById(id)
    if(product === null) return response.status(404).json({
        error: "producto no encontrado"
    })

    if(!Producto.deleteById(id)){
        return response.status(404).json({
            error: "producto no encontrado"
        })
    }

    const resp_data = {
        message: "Exito al eliminar",
        product: product
    }

    //Satus 201 para decir que el registro se creo exitosamente
    return response.status(201).render('list_product', resp_data)
})

//Indico que todas las rutas que de de alta en el Router van a estar con ese prefijo
app.use('/productos', productRouter)


app.get('/chat', (request, response) => {
    response.render('chat')
})


//Middleware de errores
app.use((error, request, response, next) => {
    return response.status(500).json({
        error: error
    })
})

httpServer.listen(PORT, () => {
    console.log(`Servidor Http escuchando en el puerto ${PORT}`)
})

httpServer.on('error', (error) => {
    console.log({error})
})

let users = []

io.on('connection', (socket) => {

    socket.on('getProducts', (data) => {
        const productos = Producto.ar_objetos
        socket.emit('loadProducts', productos)
    })

    socket.on('saveProduct', data => {
        let product = new Producto(data.title, data.price, data.thumbnail)
        
        product = Producto.create(product)

        socket.emit('loadProduct', product)
        socket.broadcast.emit('loadProduct', product)
    })

    // Chat Events
    socket.on('joinChat', (data) => {
        const user = {
            id: socket.id,
            username: data.username,
            avatarId: Math.ceil(Math.random() * 6)
        }
        users.push(user)
        socket.emit('loadUser', user)
        io.sockets.emit('users', users)
    })

    socket.on('users', data => {
        const users = data
          .map(user => {
            const userElement = `
              <li class="clearfix">
                  <img src="https://bootdey.com/img/Content/avatar/avatar${user.avatarId}.png" alt="avatar">
                  <div class="about">
                      <div class="name">${user.username}</div>
                      <div class="status"> <i class="fa fa-circle online"></i> online</div>                                           
                  </div>
              </li>`
            return userElement
          })
          .join('')
       
        usersContainer.innerHTML = users
    })

    socket.on('messageInput', data => {
        const now = new Date()
        const user = users.find(user => user.id === socket.id)
        const message = {
          text: data,
          time: `${now.getHours()}:${now.getMinutes()}`,
          user
        }
        messages.push(message)
     
        socket.emit('myMessage', message)
     
        socket.broadcast.emit('message', message)
    })

    socket.on('disconnect', reason => {
        const user = users.find(user => user.id === socket.id)
        users = users.filter(user => user.id !== socket.id)
        if (user) {
          socket.broadcast.emit('notification', `${user.username} se ha ido al chat`)
        }
        io.sockets.emit('users', users)
    })
     
})