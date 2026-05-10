const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8082,
  path: '/api/market/history/VIX/range?startDate=2026-02-09&endDate=2026-05-09',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    console.log(`BODY (first 200 chars): ${data.substring(0, 200)}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
