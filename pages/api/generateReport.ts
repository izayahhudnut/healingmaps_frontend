import type { NextApiRequest, NextApiResponse } from 'next';

export default async function generateReportHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { replacements } = req.body;

  // Validate the required replacements array
  if (!replacements || !Array.isArray(replacements) || replacements.length === 0) {
    return res.status(400).json({ error: 'Replacements array is required and must have at least one item' });
  }

  try {
    // Hardcoded SpecimenID
    const requestBody = {
      SpecimenID: '2401.00055', // Hardcoded value
      replacements,
    };

    // Call the external API
    const response = await fetch('https://healingmaps.onrender.com/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json(data);
    } else {
      return res.status(response.status).json({ error: data.error || 'Error generating report' });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
