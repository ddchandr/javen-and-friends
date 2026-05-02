exports.handler = async () => {
  const API_KEY = process.env.TT_API_KEY;
  const SERIES = [
    { seriesId: 'es_2086377', eventId: '2086909', name: 'May 16 · Harlem', capacity: 22 },
    { seriesId: 'es_2086909', eventId: '2086377', name: 'May 23 · The Bronx', capacity: 30 }
  ];

  const headers = {
    'Authorization': 'Basic ' + Buffer.from(API_KEY + ':').toString('base64'),
    'Accept': 'application/json'
  };

  try {
    const results = await Promise.all(SERIES.map(async (event) => {
      const [seriesRes, ordersRes] = await Promise.all([
        fetch(`https://api.tickettailor.com/v1/event_series/${event.seriesId}`, { headers }),
        fetch(`https://api.tickettailor.com/v1/orders?limit=100`, { headers })
      ]);
      const series = await seriesRes.json();
      const orders = await ordersRes.json();
      return {
        event,
        series,
        orders: orders.data || []
      };
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(results)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
