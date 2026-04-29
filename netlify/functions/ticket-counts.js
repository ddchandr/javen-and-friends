exports.handler = async () => {
  const API_KEY = process.env.TT_API_KEY;

  try {
    // Ticket Tailor uses event_series, not events
    const res = await fetch('https://api.tickettailor.com/v1/event_series', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(API_KEY + ':').toString('base64'),
        'Accept': 'application/json'
      }
    });
    const data = await res.json();
    console.log('Full response:', JSON.stringify(data));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
