import express from 'express';
import multer from 'multer';
import next from '../../aiko-client/node_modules/next';
import {createProxyMiddleware} from 'http-proxy-middleware';
import route from './routers';

const app = express();

// * file upload using multer
const upload = multer({dest: './upload'});
app.use('/images', express.static('./upload'));

// * encoding & json
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// * routing!
app.use('/api', route);

// * proxy port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Listening on port= ', port));
