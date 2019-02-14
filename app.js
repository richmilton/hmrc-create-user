/*
 *
 */
require('dotenv').config();
const request = require('superagent');
const express = require('express');
const winston = require('winston');
const dateFormat = require('dateformat');

// Start Client configuration
const serverToken = process.env.HMRC_SERVER_TOKEN;
const port = process.env.PORT;
const apiBaseUrl = process.env.HMRC_BASE_URL;

const createTestUserEndpoint = 'create-test-user/organisations';

const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

const log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: () => dateFormat(Date.now(), "isoDateTime"),
      formatter: (options) => `${options.timestamp()} ${options.level.toUpperCase()} ${options.message ? options.message : ''}
          ${options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : ''}`
    })
  ]
});

// home-page route
app.get('/', (req, res) => {
  res.render('index', {
    createTestUserEndpoint: createTestUserEndpoint,
  });
});

// Call an application-restricted endpoint
app.get("/createTestUser",(req,res) => {

  callApi(appRestrictedEndpoint, res, serverToken, true);
});


// Helper functions

const callApi = (resource, res, bearerToken, createTestUser) => {
  const acceptHeader = 'application/vnd.hmrc.1.0+json';
  const url = apiBaseUrl + 'create-test-user/organisations';
  const req = request
      .post(url)
      .accept(acceptHeader)
      .send({ serviceNames:
          [ 'corporation-tax',
            'paye-for-employers',
            'submit-vat-returns',
            'national-insurance',
            'self-assessment',
            'mtd-income-tax',
            'mtd-vat',
            'lisa',
            'secure-electronic-transfer',
            'relief-at-source',
            'customs-services' ] });

  log.info(`Calling ${url} with Accept: ${acceptHeader}`);

  if(bearerToken) {
    log.info('Using bearer token:', bearerToken);
    req.set('Authorization', `Bearer ${bearerToken}`);
  }
  
  req.end((err, apiResponse) => handleResponse(res, err, apiResponse));
}

const handleResponse = (res, err, apiResponse) => {
  if (err || !apiResponse.ok) {
    log.error('Handling error response: ', err);
    res.send(err);
  } else {
    res.send(apiResponse.body);
  }
};

app.listen(port,() => {
  log.info(`Started at http://localhost:${port}`);
});