import express from 'express';
import cookieParser from 'cookie-parser';

import route from './routers';

const app = express();

// * file upload using multer
app.use('/images', express.static('./upload'));

// * encoding & json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// * Cookie
app.use(cookieParser());

// * routing!
app.use('/api', route);

// * proxy port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Listening on port= ', port));
