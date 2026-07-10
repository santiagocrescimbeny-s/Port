import express, {} from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware para entender JSON
app.use(express.json());
// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Servidor Express con TypeScript funcionando!');
});
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
//# sourceMappingURL=server.js.map