'use strict';

async function callBuffer(token, query, variables) {
  const res = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables: variables || {} }),
  });

  const text = await res.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(`Buffer returned non-JSON response. HTTP ${res.status}: ${text.slice(0, 160)}`);
  }

  if (!res.ok) {
    throw new Error(data?.errors?.[0]?.message || data?.error || `Buffer HTTP ${res.status}`);
  }

  if (data.errors && data.errors.length && !data.data) {
    throw new Error(data.errors[0].message || 'Buffer GraphQL error');
  }

  return data;
}

const POSTS_QUERY = `
  query GetPosts($orgId: OrganizationId!, $statuses: [PostStatus!]!) {
    posts(
      first: 50
      input: {
        organizationId: $orgId
        filter: { status: $statuses }
        sort: [{ field: createdAt, direction: desc }]
      }
    ) {
      edges {
        node {
          id
          text
          status
          createdAt
          dueAt
          channelId
          channel { name service displayName }
          # Intentionally not querying asset URL fields yet. Buffer ImageAsset does not expose url.
          # We will add media previews back after confirming the correct asset fields.
        }
      }
    }
  }
`;

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Stamp-Demo-Key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const requiredDemoKey = process.env.STAMP_DEMO_KEY;
  if (!requiredDemoKey) {
    return {
      statusCode: 503,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'STAMP_DEMO_KEY not configured. Add this env var before enabling private sync.' }),
    };
  }

  const suppliedDemoKey = event.headers['x-stamp-demo-key'] || event.headers['X-Stamp-Demo-Key'] || '';
  if (suppliedDemoKey !== requiredDemoKey) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Unauthorized. Demo access code required.' }),
    };
  }

  const token = process.env.BUFFER_TOKEN;
  if (!token) {
    return {
      statusCode: 503,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'BUFFER_TOKEN not configured.' }),
    };
  }

  try {
    const accData = await callBuffer(token, `query { account { organizations { id name } } }`);
    const orgId = accData?.data?.account?.organizations?.[0]?.id;

    if (!orgId) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ posts: [], orgId: null, error: 'No Buffer organization found for this token.' }),
      };
    }

    // Buffer support confirmed these statuses are valid for draft/approval workflows.
    // scheduled is included so creators can also send scheduled posts for client review if needed.
    const requestedStatuses = ['draft', 'needs_approval', 'scheduled'];
    const postsData = await callBuffer(token, POSTS_QUERY, { orgId, statuses: requestedStatuses });
    const edges = postsData?.data?.posts?.edges || [];

    const seen = new Set();
    const posts = edges
      .filter(function(edge) {
        const id = edge?.node?.id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map(function(edge) {
        const node = edge.node || {};
        // Keep image empty for now. Querying ImageAsset.url breaks against Buffer's current schema.
        // The app can still import captions, channels, dates, and statuses without media previews.
        let image = '';

        const channel = node.channel || {};

        return {
          bufferId:     node.id,
          caption:      node.text || '',
          image:        image,
          platform:     channel.displayName || channel.name || channel.service || 'Buffer',
          service:      channel.service || '',
          channelId:    node.channelId || '',
          bufferStatus: node.status || 'draft',
          dueAt:        node.dueAt || null,
          createdAt:    node.createdAt || new Date().toISOString(),
        };
      });

    const counts = posts.reduce(function(acc, post) {
      const key = post.bufferStatus || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ posts, orgId, requestedStatuses, counts }),
    };
  } catch (err) {
    console.error('[Stamp buffer-drafts]', err);
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || 'Buffer sync failed' }),
    };
  }
};
