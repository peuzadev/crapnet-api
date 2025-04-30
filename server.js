require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const app = express();
const port = process.env.PORT || 3000;


const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
const onuRoutes = require('./routes/onuRoutes');



app.use('/api', onuRoutes); 

app.get('/', (req, res) => {
  res.send('API Crapnet rodando 🔧');
});


app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
  });
  next();
});
app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});
