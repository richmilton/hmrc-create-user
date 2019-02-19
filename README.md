hmrc-create-user
================

Application to create test users. The HMRC web page designed to create test users does not produce accounts usable for VAT apparently.

This is a nodejs adaption of HMRC example code that can be used to create users.

Needs the following environment variables in .env:

```
HMRC_SERVER_TOKEN=your_server_token
HMRC_BASE_URL=https://test-api.service.hmrc.gov.uk/
PORT=port_listen #eg:8888
```
The node dependencies can be installed locally by running:
```
npm install
```

The server can be started with the following command:
```
npm start
```

Once running, the application will be available at:

```
http://localhost:{process.env.PORT}/
```

### License

http://www.apache.org/licenses/LICENSE-2.0