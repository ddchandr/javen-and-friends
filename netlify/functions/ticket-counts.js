exports.handler = async () => {
  const API_KEY = process.env.TT_API_KEY;
  // 2086909 = May 16 Harlem, 2086377 = May 23 Bronx
  const EVENT_IDS = ['2086909', '2086377'];

  try {
    const results = await Promise.all(EVENT_IDS.map(async (id) => {
      const res = await fetch(`https://api.tickettailor.com/v1/events/${id}`, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(API_KEY + ':').toString('base64'),
          'Accept': 'application/json'
        }
      });
      const data = await res.json();

      // Log full response so we can see exact field names in Netlify logs
      console.log(`Event ${id}:`, JSON.stringify(data));

      // Try multiple possible field names
      const remaining = data.tickets_available ?? data.remaining_tickets ?? data.available ?? null;
      const total = data.total_issued_tickets ?? data.capacity ?? data.total ?? null;

      return { id, total, remaining, status: data.status ?? 'unknown' };
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
