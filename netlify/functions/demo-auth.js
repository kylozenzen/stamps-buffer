'use strict';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Stamp-Demo-Key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const requiredDemoKey = process.env.STAMP_DEMO_KEY;
  if (!requiredDemoKey) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ ok: false, error: 'STAMP_DEMO_KEY not configured.' }),
    };
  }

  const suppliedDemoKey = event.headers['x-stamp-demo-key'] || event.headers['X-Stamp-Demo-Key'] || '';
  if (suppliedDemoKey !== requiredDemoKey) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ ok: false, error: 'Invalid demo access code.' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true }),
  };
};
