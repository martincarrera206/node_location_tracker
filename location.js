class Producto{
    static ar_objetos = [
    ]

    constructor(title, price, thumbnail){
        this.title = title
        this.price = price
        this.thumbnail = thumbnail
    }

    static create(_obj){
        let data = this.getAll()
        const _ar_objetos = (data !== '' && data[0] !== undefined ? data : [])
        _obj.id = (_ar_objetos.length == 0 ? 1 : _ar_objetos[_ar_objetos.length - 1].id + 1 ) 
        _ar_objetos.push(_obj)
        this.ar_objetos = _ar_objetos
        return _obj
    }

    static update(_obj){
        const ar_objetos = this.getAll()
        let encontrado = false
        for (let index = 0; index < ar_objetos.length; index++) {
            if(ar_objetos[index].id == _obj.id){
                encontrado = true
                ar_objetos[index].title = _obj.title
                ar_objetos[index].price = _obj.price
                ar_objetos[index].thumbnail = _obj.thumbnail
            } 
        }
        Producto.ar_objetos = ar_objetos
        return encontrado
    }

    static getById(obj_id){
        try {
            const ar_objetos = this.getAll()
            //Probamos usando el find()
            const obj_deseado = ar_objetos.find((element) => {
                return element.id == obj_id
            })
            return (obj_deseado != undefined && obj_deseado.id != undefined ? obj_deseado : null)
        } catch (errorGetById) {
            console.log({errorGetById})
            return null
        }
    }

    static getAll(){
        return Producto.ar_objetos;
    }

    static deleteById(obj_id){
        const ar_objetos = this.getAll()
        const new_ar_objetos = []
        let encontrado = false
        for (let index = 0; index < ar_objetos.length; index++) {
            const obj = ar_objetos[index];
            if(obj.id !== obj_id){
                new_ar_objetos.push(ar_objetos[index]) 
            }else{
                encontrado = true
            }
        }
        Producto.ar_objetos = new_ar_objetos
        return encontrado
    }

    static deleteAll(){
        Producto.ar_objetos = []
    }

}

module.exports = Producto
