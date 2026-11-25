const https = require('https');
const fs = require('fs');

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'jolcqqwvzrvqydzxpwij';
const SUPABASE_MGMT_TOKEN = process.env.SUPABASE_MGMT_TOKEN || '';

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_MGMT_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({ status: res.statusCode, body: parsed });
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject({ status: res.statusCode, body });
          }
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(data);
    req.end();
  });
}

// If run from command line with an SQL file or string argument
if (require.main === module) {
  const arg = process.argv[2];
  if (!arg) {
    console.log("Usage: node scripts/run_sql.js <sql_file_or_query>");
    process.exit(1);
  }

  let sql = arg;
  if (fs.existsSync(arg)) {
    sql = fs.readFileSync(arg, 'utf8');
  }

  executeSql(sql)
    .then(res => {
      console.log("SUCCESS:", JSON.stringify(res, null, 2));
    })
    .catch(err => {
      console.error("ERROR:", JSON.stringify(err, null, 2));
      process.exit(1);
    });
}

module.exports = { executeSql };
