const axios = require('axios');

const payload = {
    "usuarioId": 6,
    "estadoId": 6,
    "metodoPago": "Otro",
    "direccionEntrega": "Calle 101 # 45-89",
    "ciudadEntrega": "Bogotá D.C.",
    "departamentoEntrega": "",
    "observaciones": "",
    "plazoAbonos": 2,
    "subtotal": 275000,
    "envio": 0,
    "total": 275000,
    "tipoVenta": "Pedido",
    "detalleVenta_Pedido": [
        {
            "productoId": 8,
            "cantidad": 11,
            "precioUnitario": 25000,
            "subtotal": 275000
        }
    ]
};

async function test() {
    try {
        const res = await axios.post('http://localhost:3000/api/VentaPedidos', payload);
        console.log("SUCCESS:", res.status);
    } catch (err) {
        if (err.response) {
            console.log("ERROR STATUS:", err.response.status);
            console.log("ERROR DATA:", err.response.data);
        } else {
            console.log("ERROR:", err.message);
        }
    }
}

test();
