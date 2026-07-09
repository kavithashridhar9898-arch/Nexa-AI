import { VercelResponse } from '@vercel/node';
import { db } from '../_config/db';
import { withAuth, AuthenticatedRequest } from '../_config/auth';
import { generateRandomId } from '../_utils/crypto';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const userId = req.user?.userId;
  const { id } = req.query;

  if (!userId) return res.status(401).json({ error: 'Unauthorized.' });
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid workflow ID.' });
  }

  // GET: Fetch workflow details
  if (req.method === 'GET') {
    try {
      const rows = await db.query('SELECT * FROM workflows WHERE id = ? AND user_id = ?', [id, userId]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Workflow not found.' });
      }

      const row = rows[0];
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

      return res.status(200).json({
        workflow: {
          ...row,
          is_active: row.is_active === 1 || row.is_active === true || row.is_active === '1',
          nodes,
          edges
        }
      });
    } catch (error) {
      console.error('[Get Workflow By Id] Error:', error);
      return res.status(500).json({ error: 'Failed to fetch workflow.' });
    }
  }

  // PUT: Update workflow configurations
  if (req.method === 'PUT') {
    try {
      const { name, description, trigger_type, nodes, edges, is_active } = req.body;

      const existing = await db.query('SELECT * FROM workflows WHERE id = ? AND user_id = ?', [id, userId]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Workflow not found.' });
      }

      const wf = existing[0];
      const finalName = name !== undefined ? name : wf.name;
      const finalDescription = description !== undefined ? description : wf.description;
      const finalTrigger = trigger_type !== undefined ? trigger_type : wf.trigger_type;
      const finalNodes = nodes !== undefined ? JSON.stringify(nodes) : wf.nodes;
      const finalEdges = edges !== undefined ? JSON.stringify(edges) : wf.edges;
      
      let finalActive = wf.is_active;
      if (is_active !== undefined) {
        finalActive = is_active ? 1 : 0;
      }

      await db.execute(
        'UPDATE workflows SET name = ?, description = ?, trigger_type = ?, nodes = ?, edges = ?, is_active = ? WHERE id = ? AND user_id = ?',
        [finalName, finalDescription, finalTrigger, finalNodes, finalEdges, finalActive, id, userId]
      );

      return res.status(200).json({
        message: 'Workflow updated successfully.',
        workflow: {
          id,
          user_id: userId,
          name: finalName,
          description: finalDescription,
          trigger_type: finalTrigger,
          nodes: nodes !== undefined ? nodes : JSON.parse(wf.nodes),
          edges: edges !== undefined ? edges : JSON.parse(wf.edges),
          is_active: finalActive === 1 || finalActive === true || finalActive === '1'
        }
      });
    } catch (error) {
      console.error('[Update Workflow] Error:', error);
      return res.status(500).json({ error: 'Failed to update workflow.' });
    }
  }

  // DELETE: Delete workflow record
  if (req.method === 'DELETE') {
    try {
      const existing = await db.query('SELECT name FROM workflows WHERE id = ? AND user_id = ?', [id, userId]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Workflow not found.' });
      }

      const name = existing[0].name;

      await db.execute('DELETE FROM workflows WHERE id = ? AND user_id = ?', [id, userId]);

      const notificationId = generateRandomId();
      await db.execute(
        'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
        [
          notificationId,
          userId,
          'Workflow Deleted',
          `The workflow "${name}" was deleted.`,
          'INFO'
        ]
      );

      return res.status(200).json({ message: 'Workflow deleted successfully.' });
    } catch (error) {
      console.error('[Delete Workflow] Error:', error);
      return res.status(500).json({ error: 'Failed to delete workflow.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}

export default withAuth(handler);
