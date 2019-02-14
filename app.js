/*
 *
 */
require('dotenv').config();
const request = require('superagent');
const express = require('express');
const winston = require('winston');

// Start Client configuration
const serverToken = process.env.HMRC_SERVER_TOKEN;
const port = process.env.PORT;
const apiBaseUrl = process.env.HMRC_BASE_URL;

const endpoints = {
  individual: 'create-test-user/individuals',
  organisation: 'create-test-user/organisations',
  agent: 'create-test-user/agents'
};

const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

const log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
});

// home-page route
app.get('/', (req, res) => {
  res.render('index', {
    endpoints: endpoints,
  });
});

// Call an application-restricted endpoint
app.get("/createTestUser",(req,res) => {
  const type = req.query.type;

  callApi(endpoints[type], res, serverToken);
});


// Helper functions

const callApi = (resource, res, bearerToken) => {
  const acceptHeader = 'application/vnd.hmrc.1.0+json';
  const url = apiBaseUrl + resource;
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
};

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