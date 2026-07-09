import { VercelResponse } from '@vercel/node';
import { db } from '../_config/db';
import { withAuth, AuthenticatedRequest } from '../_config/auth';
import { generateRandomId } from '../_utils/crypto';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

  if (req.method === 'GET') {
    try {
      const rows = await db.query('SELECT * FROM workflows WHERE user_id = ? ORDER BY created_at DESC', [userId]);

      const workflows = rows.map((row: any) => {
        let nodes = [];
        let edges = [];
        try {
          nodes = row.nodes ? JSON.parse(row.nodes) : [];
        } catch (e) {
          console.error('Failed to parse nodes JSON for workflow:', row.id);
        }
        try {
          edges = row.edges ? JSON.parse(row.edges) : [];
        } catch (e) {
          console.error('Failed to parse edges JSON for workflow:', row.id);
        }

        return {
          ...row,
          is_active: row.is_active === 1 || row.is_active === true || row.is_active === '1',
          nodes,
          edges
        };
      });

      return res.status(200).json({ workflows });
    } catch (error) {
      console.error('[Get Workflows] Error:', error);
      return res.status(500).json({ error: 'Failed to fetch workflows.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, description, trigger_type, nodes, edges } = req.body;

      if (!name || !trigger_type) {
        return res.status(400).json({ error: 'Name and trigger_type are required.' });
      }

      const workflowId = generateRandomId();
      const nodesStr = nodes ? JSON.stringify(nodes) : '[]';
      const edgesStr = edges ? JSON.stringify(edges) : '[]';

      await db.execute(
        'INSERT INTO workflows (id, user_id, name, description, trigger_type, nodes, edges, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        [workflowId, userId, name, description || '', trigger_type, nodesStr, edgesStr]
      );

      const notificationId = generateRandomId();
      await db.execute(
        'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
        [
          notificationId,
          userId,
          'Workflow Created',
          `The workflow "${name}" was created successfully.`,
          'SUCCESS'
        ]
      );

      return res.status(201).json({
        message: 'Workflow created successfully.',
        workflow: {
          id: workflowId,
          user_id: userId,
          name,
          description,
          trigger_type,
          nodes: nodes || [],
          edges: edges || [],
          is_active: 1
        }
      });
    } catch (error) {
      console.error('[Create Workflow] Error:', error);
      return res.status(500).json({ error: 'Failed to create workflow.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}

export default withAuth(handler);
