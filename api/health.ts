import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './_config/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    // Quick DB query check
    await db.query('SELECT 1');
    return res.status(200).json({
      status: 'healthy',
      database: 'mysql-serverless',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Health Check] Error:', error);
    return res.status(500).json({
      status: 'unhealthy',
      error: error.message || 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
}
