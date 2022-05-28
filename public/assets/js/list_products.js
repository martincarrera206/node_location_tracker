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
