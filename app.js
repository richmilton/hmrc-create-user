/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
require('dotenv').config();
const request = require('superagent');
const express = require('express');
const winston = require('winston');

const serverToken = process.env.HMRC_SERVER_TOKEN;
const port = process.env.PORT;
const apiBaseUrl = process.env.HMRC_BASE_URL;
const hmrcCreateUserPath = 'create-test-user';
const appCreateUserEndpoint = '/createTestUser';

const hmrcEndpoints = {
  individual: `${hmrcCreateUserPath}/individuals`,
  organisation: `${hmrcCreateUserPath}/organisations`,
  agent: `${hmrcCreateUserPath}/agents`
};

const app = express();

app.set('view engine', 'ejs');

const log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
});

app.get('/', (req, res) => {
  res.render('index', {
    endpoints: hmrcEndpoints,
  });
});

app.get(appCreateUserEndpoint, (req,res) => {
  const type = req.query.type;

  callApi(hmrcEndpoints[type], res, serverToken);
});

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