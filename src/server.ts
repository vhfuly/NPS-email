import 'reflect-metadata';
import express from 'express';
import './database';

const app = express();

app.get('/users', (request, response) => {
return response.send('helllo World - nlw#04')
});
app.listen(3333, () => console.log('Server is running!'))