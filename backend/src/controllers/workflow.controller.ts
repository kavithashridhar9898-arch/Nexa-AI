import { Request, Response } from 'express';
import { db } from '../config/db';
import { generateRandomId } from '../utils/crypto';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const createWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

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

    // Create a success notification
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
};

export const getWorkflows = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

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
};

export const getWorkflowById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

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
};

export const updateWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

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
};

export const deleteWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const existing = await db.query('SELECT name FROM workflows WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Workflow not found.' });
    }

    const name = existing[0].name;

    await db.execute('DELETE FROM workflows WHERE id = ? AND user_id = ?', [id, userId]);

    // Create a notification
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
};
