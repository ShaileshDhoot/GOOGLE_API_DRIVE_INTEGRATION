const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const app = express();
const server = http.createServer(app);
const path = require('path');

const PORT = 3000;

dotenv.config();

const downloadRoutes = require('./routes/downloadRoutes')
const uploadRoutes = require('./routes/uploadRoutes')

app.use(express.static(path.join(__dirname, '/')));

//Routes
app.use('/', uploadRoutes);     

app.use('/', downloadRoutes); 

app.use('/', (_, res) => res.status(404).send("NOT FOUND"));




const cb = () => console.log('Server is Running on ', PORT)


server.listen(PORT, cb)

