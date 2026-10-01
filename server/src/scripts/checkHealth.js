const http = require('http');
const config = require('../config/env');

const healthUrl = `http://127.0.0.1:${config.port}/api/v1/health`;

console.log(`Checking API health status at ${healthUrl}...`);

const req = http.get(healthUrl, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('✅ API Health Check Succeeded:');
      console.log(JSON.stringify(parsed, null, 2));
      if (res.statusCode === 200 && parsed.status === 'ok') {
        process.exit(0);
      } else {
        console.error('❌ Health check returned abnormal status:', res.statusCode);
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Failed to parse health check response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error(`❌ Health check connection failed: ${err.message}`);
  process.exit(1);
});

req.setTimeout(5000, () => {
  console.error('❌ Health check timed out after 5 seconds');
  req.destroy();
  process.exit(1);
});

