import express from 'express';
import publicRoutes from './routes/public'
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';




const app = express();

app.use(express.json())// parapoder receber os .json 

app.use('/',publicRoutes)




const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fifa save matchs',
      version: '1.0.0',
      description: 'API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/public.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.listen(3000, () => console.info("Servidor inicializando"));