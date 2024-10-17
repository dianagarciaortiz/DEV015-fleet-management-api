"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const port = 3000;
app.use(express_1.default.json());
// Endpoint para obtener taxis filtrados por placa
app.get('/taxis', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Saltar los registros anteriores
        const { plates, page = 2 } = req.query;
        const pageNumber = parseInt(page) || 1; // Número de página
        const pageSize = 10; // Cantidad de registros por página (10)
        const skip = (pageNumber - 1) * pageSize; // Saltar los registros de las páginas anteriores
        // Filtrar por placa si se proporciona
        const taxis = yield prisma.taxis.findMany({
            where: {
                plate: {
                    contains: plates ? String(plates) : undefined, // Filtrar solo si hay una placa en la query
                }
            },
            skip: skip, // Saltar registros
            take: pageSize, // Limitar a 10 resultados por página
            //include: {
            // trajectories: true, // Incluye las trayectorias relacionadas
            //},
        });
        res.json(taxis);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los taxis' });
    }
}));
app.get('/taxis/:id/trajectories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { date } = req.query;
    try {
        // Consultar las trayectorias filtradas por taxiId y fecha
        const trajectories = yield prisma.trajectories.findMany({
            where: {
                taxi_id: Number(id),
                date: date ? { equals: new Date(date) } : undefined, // Filtrar por fecha si se proporciona
            },
            select: {
                latitude: true, // Seleccionar latitud
                longitude: true, // Seleccionar longitud
                date: true, // Seleccionar timestamp (fecha y hora)
            },
        });
        // Responder con las trayectorias obtenidas
        res.json(trajectories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ocurrió un error al obtener las trayectorias' });
    }
}));
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
//config para que se reinicie solo en pack json
//FILTAR POR ID DEL TAXI Y POR FECHA, DIA MES AÑO, CONVERTIR LA FECHA EN UN RANGO DE HORA 
