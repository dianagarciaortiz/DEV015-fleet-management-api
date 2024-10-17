import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = 3000;

app.use(express.json());

// Endpoint para obtener taxis filtrados por placa
app.get('/taxis', async (req: Request, res: Response) => {
    try {
        // Saltar los registros anteriores

        const { plates, page = 2 } = req.query;

        const pageNumber = parseInt(page as string) || 1;  // Número de página
        const pageSize = 10;                               // Cantidad de registros por página (10)
        const skip = (pageNumber - 1) * pageSize;          // Saltar los registros de las páginas anteriores


        // Filtrar por placa si se proporciona
        const taxis = await prisma.taxis.findMany({
            where: {
                plate: {
                    contains: plates ? String(plates) : undefined, // Filtrar solo si hay una placa en la query
                }
            },
            skip: skip,         // Saltar registros
            take: pageSize,     // Limitar a 10 resultados por página
            //include: {
            // trajectories: true, // Incluye las trayectorias relacionadas
            //},
        });


        res.json(taxis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los taxis' });
    }
});

app.get('/taxis/:id/trajectories', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { date } = req.query;
  
    try {
      // Consultar las trayectorias filtradas por taxiId y fecha
      const trajectories = await prisma.trajectories.findMany({
        where: {
          taxi_id: Number(id),
          date: date ? { equals: new Date(date as string) } : undefined, // Filtrar por fecha si se proporciona
        },
        select: {
          latitude: true,    // Seleccionar latitud
          longitude: true,   // Seleccionar longitud
          date: true,   // Seleccionar timestamp (fecha y hora)
        },
      });
  
      // Responder con las trayectorias obtenidas
      res.json(trajectories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ocurrió un error al obtener las trayectorias' });
    }
  });

// Iniciar el servidor
app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
//config para que se reinicie solo en pack json
//FILTAR POR ID DEL TAXI Y POR FECHA, DIA MES AÑO, CONVERTIR LA FECHA EN UN RANGO DE HORA 