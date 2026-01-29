import express from 'express';
import publicRoutes from './routes/public'
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import cors from 'cors';





const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()),
}))


app.use( express.json())// parapoder receber os .json 

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

const PORT = Number(process.env.PORT) || 3000 



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API rodando na porta ${PORT}`)
})