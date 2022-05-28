const socket = io()

const productListContainer = document.getElementById('productListContainer')

socket.emit('getProducts')

socket.on('loadProducts', products => {
    let listBody = `
        <tr id="emptyProducts">
            <td colspan="3" class="text-center">No hay productos cargados</td>
        </tr>
    `
    if(products.length > 0){
        listBody = products
            .map(product => {
                const productElement = `
                <tr>
                    <td><img src="${product.thumbnail}" width="64" /></td>
                    <td>${product.title}</td>
                    <td>${product.price}</td>
                </tr>
                `
                return productElement
            })
            .join('')
    }

    productListContainer.innerHTML = listBody
})

socket.on('loadProduct', product => {
    const emptyProducts = document.getElementById('emptyProducts')
    if(emptyProducts != undefined) emptyProducts.remove()
    let productRow = `
        <tr>
            <td><img src="${product.thumbnail}" width="64" /></td>
            <td>${product.title}</td>
            <td>${product.price}</td>
        </tr>
    `
    productListContainer.innerHTML += productRow
})

const productTitle = document.getElementById('title')
const productPrice = document.getElementById('price')
const productThumbnail = document.getElementById('thumbnail')

const btnSaveProduct = document.getElementById('btnSaveProduct')
btnSaveProduct.addEventListener('click', () =>{
    const product = {
        title : productTitle.value,
        price : productPrice.value,
        thumbnail : productThumbnail.value
    }
    socket.emit('saveProduct', product)
    productTitle.value = ''
    productPrice.value = ''
    productThumbnail.value = ''
})


//Ayudita para los tests ;)
const btnAutoComplete = document.getElementById('btnAutoComplete')
btnAutoComplete.addEventListener('click', () =>{
    console.log('Cargando producto aleatorio al formulario')
    const products = [
        {
            title : 'Basketball',
            price : 150,
            thumbnail : 'https://cdn0.iconfinder.com/data/icons/sports-59/512/Basketball-128.png'
        },
        {
            title : 'Bicicleta',
            price : 649.99,
            thumbnail : 'https://cdn1.iconfinder.com/data/icons/UrbanStories-png-Artdesigner-lv/256/Bicycle_by_Artdesigner.lv.png'
        },
        {
            title : 'Casco de Vikingo',
            price : 480.50,
            thumbnail : 'https://cdn1.iconfinder.com/data/icons/photo-stickers-hats/128/hat_4-128.png'
        }
    ]
    const randomProduct = products[Math.floor(Math.random() * 3)]
    productTitle.value = randomProduct.title
    productPrice.value = randomProduct.price
    productThumbnail.value = randomProduct.thumbnail
})