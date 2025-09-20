import express from 'express';
import bodyParser from 'body-parser';
import webhookRoute from './routes/webhookRoute.js';
import apiRoutes from './routes/apiRoutes.js';
import { DB_FILE } from './config/dbConfig.js';
import './db/migrate.js'; // run migrations at startup

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', webhookRoute);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
  console.log('DB file:', DB_FILE);
});
