/**
 * *** NOTE ON IMPORTING FROM ANGULAR AND NGUNIVERSAL IN THIS FILE ***
 *
 * If your application uses third-party dependencies, you'll need to
 * either use Webpack or the Angular CLI's `bundleDependencies` feature
 * in order to adequately package them for use on the server without a
 * node_modules directory.
 *
 * However, due to the nature of the CLI's `bundleDependencies`, importing
 * Angular in this file will create a different instance of Angular than
 * the version in the compiled application code. This leads to unavoidable
 * conflicts. Therefore, please do not explicitly import from @angular or
 * @nguniversal in this file. You can export any needed resources
 * from your application's main.server.ts file, as seen below with the
 * import for `ngExpressEngine`.
 */

import 'zone.js/dist/zone-node';

import * as fs from 'fs';
import * as express from 'express';
import { join } from 'path';
import * as domino from 'domino';
import * as mailer from 'nodemailer';
import { getTemplate } from './email-template';
import { createSitemap } from 'sitemap';
import { RESPONSE } from '@nguniversal/express-engine/tokens';

const DIST_FOLDER = join(process.cwd(), 'app', 'public');

const template = fs.readFileSync(join(DIST_FOLDER, 'index.html')).toString();
// for mock global window by domino
const win = domino.createWindow(template);

// mock
global['window'] = win;
// not implemented property and functions
Object.defineProperty(win.document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

global['getComputedStyle'] = () => {
  return {
    getPropertyValue() {
      return '';
    }
  };
};

// mock documnet
global['document'] = win.document;
// othres mock
global['CSS'] = null;
// global['XMLHttpRequest'] = require('xmlhttprequest').XMLHttpRequest;
global['Prism'] = null;

// Express server
const app = express();
app.use(express.json());

const sitemap = createSitemap({
  hostname: 'https://guitar-scales.org',
  cacheTime: 600000, // 600 sec - cache purge period
  urls: [
    { url: '/', priority: 1, lastmod: '2019-08-24' },
    { url: '/fretboard/', priority: 1, lastmod: '2019-08-23' },
    { url: '/privacy-policy/', lastmod: '2019-08-23', priority: 0.5 },
    { url: '/terms-of-use/', lastmod: '2019-08-23', priority: 0.5 },
    { url: '/contacts/', lastmod: '2019-08-23', priority: 0.5 }
  ]
});

const PORT = process.env.PORT || 4200;

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {AppServerModuleNgFactory, LAZY_MODULE_MAP, ngExpressEngine, provideModuleMap} = require('./dist/server/main');

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

// Example Express Rest API endpoints
// app.get('/api/**', (req, res) => { });

const mailerAuthOptions = {
  type: 'OAuth2',
  user: 'alexey.tuichiev@gmail.com',
  clientId: '598451784986-85o0rbel0r2cb8mitpsnuadef1049ivb.apps.googleusercontent.com',
  clientSecret: 'KSqsug0dGkZ3on_PKSXnuZg5',
  refreshToken: '1/XsEFeFt-WtLFURIhaCQBVMlN6C_n4nj3cCeW63bmSho',
};

const smtpTransport = mailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  secure: true,
  port: 465,
  auth: mailerAuthOptions
});

app.post('/api/email', (req, res) => {
  const mailOptions = {
    from: req.body.name,
    to: 'decent-alex@yandex.ru',
    subject: 'Guitar Scales\'s user',
    text: req.body.message,
    html: getTemplate({name: req.body.name, email: req.body.email, message: req.body.message})
  };

  smtpTransport.sendMail(mailOptions)
    .then(() => {
      res.status(200).json({'message': 'success'});
      console.log('Email has been sended');
    })
    .catch(error => {
      res.status(400).json({'error': error.message});
      console.log('There was an error sending the email');
      console.log(error);
    });
});

app.get('/sitemap.xml', function(req, res) {
  try {
    const xml = sitemap.toXML();
    res.header('Content-Type', 'application/xml');
    res.send( xml );
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

// Serve static files from /public
app.get('*.*', express.static(DIST_FOLDER, {
  maxAge: '1y'
}));

// All regular routes use the Universal engine
// app.get('*', (req, res) => {
//   res.render('index', { req, res });
// });

app.get('*', async (req, res) => {
  res.render('index', {req, res, providers: [
      {
        provide: RESPONSE,
        useValue: res,
      },
    ]}, (error, html) => {
    if (error) {
      console.log(`Error generating html for req ${req.url}`, error);
      return (req as any).next(error);
    }

    res.send(html);

    if (!error) {
      if (res.statusCode === 200) {
        //toCache(req.url, html);
      }
    }
  });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
