exports.handler = async () => {
  const API_KEY = process.env.TT_API_KEY;
  const SERIES = [
    { seriesId: 'es_2086377', name: 'May 16 · Harlem', capacity: 22 },
    { seriesId: 'es_2086909', name: 'May 23 · The Bronx', capacity: 30 }
  ];

  const headers = {
    'Authorization': 'Basic ' + Buffer.from(API_KEY + ':').toString('base64'),
    'Accept': 'application/json'
  };

  try {
    // Fetch all orders and both event series in parallel
    const [ordersRes, ...seriesRes] = await Promise.all([
      fetch('https://api.tickettailor.com/v1/orders?limit=100&status=completed', { headers }),
      ...SERIES.map(s => fetch(`https://api.tickettailor.com/v1/event_series/${s.seriesId}`, { headers }))
    ]);

    const ordersData = await ordersRes.json();
    const allOrders = ordersData.data || [];
    const seriesData = await Promise.all(seriesRes.map(r => r.json()));

    const results = SERIES.map((event, i) => {
      const series = seriesData[i];
      // Filter orders to only this event series
      const orders = allOrders.filter(o =>
        o.event_summary?.event_series_id === event.seriesId
      );
      return { event, series, orders };
    });

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
