const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const BASE_URL = 'https://api.policeroleplay.community/v1';

async function getServerInfo() {
  try {
    const res = await fetch(`${BASE_URL}/server`, {
      headers: {
        'Server-Key': process.env.ERLC_API_KEY,
      }
    });

    if (!res.ok) {
      console.error(`ERLC API error: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('Failed to fetch ERLC server info:', err);
    return null;
  }
}

async function getServerPlayers() {
  try {
    const res = await fetch(`${BASE_URL}/server/players`, {
      headers: {
        'Server-Key': process.env.ERLC_API_KEY,
      }
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch players:', err);
    return [];
  }
}

async function getServerQueue() {
  try {
    const res = await fetch(`${BASE_URL}/server/queue`, {
      headers: {
        'Server-Key': process.env.ERLC_API_KEY,
      }
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch queue:', err);
    return [];
  }
}

module.exports = { getServerInfo, getServerPlayers, getServerQueue };
