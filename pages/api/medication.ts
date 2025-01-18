import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  // Validate the query string
  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    return res
      .status(400)
      .json({ error: 'Query parameter is required and must be at least 3 characters long' });
  }

  try {
    console.log(`Fetching: https://healingmaps.onrender.com/drug-lookup/${query}`);

    const response = await fetch(`https://healingmaps.onrender.com/drug-lookup/${query}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error('Error Response Body:', responseBody);
      throw new Error(`Failed to fetch from external API: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in API handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
