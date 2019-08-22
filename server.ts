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

import * as express from 'express';
import { join } from 'path';
import * as mailer from 'nodemailer';
import { getTemplate } from './email-template';
import { createSitemap } from 'sitemap';

// Express server
const app = express();
app.use(express.json());

const sitemap = createSitemap({
  hostname: 'https://guitar-scales.org',
  cacheTime: 600000, // 600 sec - cache purge period
  urls: [
    { url: '/fretboard/', priority: 1, lastmod: '2019-08-23' },
    { url: '/privacy-policy/', lastmod: '2019-08-23', priority: 0.5 },
    { url: '/terms-of-use/', lastmod: '2019-08-23', priority: 0.5 },
    { url: '/contacts/', lastmod: '2019-08-23', priority: 0.5 }
  ]
});

const PORT = process.env.PORT || 4200;
const DIST_FOLDER = join(process.cwd(), 'public');

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

const accessToken = 'ya29.GltpB9oKc1lH79ie6RO5xNEY08Wg6eBbztEXl3SoTQA5xmF4lxHK-6r-SjkXOnaftNRo3roY4b-r12MK6vymgHzJwz8tjbEFh5mlCqa8VZRqeHiQXm9t-RJBQ-j1';

const mailerAuthOptions = {
  type: 'OAuth2',
  user: 'alexey.tuichiev@gmail.com',
  clientId: '598451784986-85o0rbel0r2cb8mitpsnuadef1049ivb.apps.googleusercontent.com',
  clientSecret: 'KSqsug0dGkZ3on_PKSXnuZg5',
  refreshToken: '1/kyh_3QiZ1k9H0gu6v-zJJddqQyf1x_-U3wBAsRHKfKUxPm647H8WLlOuB1QqrRTJ',
  accessToken: accessToken
};

const smtpTransport = mailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: mailerAuthOptions,
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
app.get('*', (req, res) => {
  res.render('index', { req });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
