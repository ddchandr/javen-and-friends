exports.handler = async () => {
  const API_KEY = process.env.TT_API_KEY;
  // es_2086377 = May 16 Harlem (22 tickets), es_2086909 = May 23 Bronx (30 tickets)
  const EVENT_SERIES_IDS = ['es_2086377', 'es_2086909'];

  try {
    const res = await fetch('https://api.tickettailor.com/v1/event_series', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(API_KEY + ':').toString('base64'),
        'Accept': 'application/json'
      }
    });
    const data = await res.json();
    const series = data.data || [];

    const results = EVENT_SERIES_IDS.map(id => {
      const event = series.find(e => e.id === id);
      if (!event) return { id, total: null, remaining: null, status: 'not_found' };

      const ticketType = event.default_ticket_types?.[0];
      const total     = ticketType?.quantity_total ?? null;
      const issued    = ticketType?.quantity_issued ?? 0;
      const held      = ticketType?.quantity_held ?? 0;
      const inBaskets = ticketType?.quantity_in_baskets ?? 0;
      const remaining = total !== null ? total - issued - held - inBaskets : null;

      return { id, total, remaining, status: event.status };
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
