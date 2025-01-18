import type { NextApiRequest, NextApiResponse } from 'next';

type Reference = {
  referenceAuthors: string;
  referenceID: number;
  referenceName: string;
  referencePublicationDate: string;
  referencePublicationInformation: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { explanationId } = req.body;

  if (!explanationId) {
    return res.status(400).json({ error: 'Explanation ID is required' });
  }

  try {
    const response = await fetch(`https://healingmaps.onrender.com/reference/${explanationId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reference: ${response.statusText}`);
    }

    const referenceData: Reference[] = await response.json();
    return res.status(200).json(referenceData);
  } catch (error) {
    console.error('Error fetching reference:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}