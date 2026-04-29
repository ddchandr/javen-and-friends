exports.handler = async () => {
  const API_KEY = process.env.TT_API_KEY;
  const EVENT_IDS = ['2086909', '2086377'];

  try {
    const res = await fetch('https://api.tickettailor.com/v1/events', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(API_KEY + ':').toString('base64'),
        'Accept': 'application/json'
      }
    });
    const data = await res.json();

    console.log('Events list:', JSON.stringify(data));

    const events = data.data || data;

    const results = EVENT_IDS.map(id => {
      const event = events.find(e => String(e.id) === String(id));
      if (!event) return { id, total: null, remaining: null, status: 'not_found' };

      console.log(`Event ${id} fields:`, JSON.stringify(event));

      const remaining = event.tickets_available ?? event.remaining_tickets ?? event.available ?? null;
      const total = event.total_issued_tickets ?? event.capacity ?? event.total ?? null;

      return { id, total, remaining, status: event.status ?? 'unknown' };
    });

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
