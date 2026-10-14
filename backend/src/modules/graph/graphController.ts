import { Response } from 'express';
import { db } from '../../database/db.js';
import { AuthRequest } from '../../middleware/authMiddleware.js';

export interface GraphNode {
  id: string;
  label: string;
  type: 'CUSTOMER' | 'ACCOUNT' | 'DEVICE' | 'MERCHANT' | 'TRANSACTION' | 'LOCATION' | 'RECIPIENT_VPA';
  riskLevel: 'SAFE' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: Record<string, any>;
}

export interface GraphLink {
  source: string;
  target: string;
  relationship: string;
}

export async function getEntityGraph(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const nodes: Map<string, GraphNode> = new Map();
    const links: GraphLink[] = [];

    // Helper to safely add node
    const addNode = (node: GraphNode) => {
      if (!nodes.has(node.id)) {
        nodes.set(node.id, node);
      }
    };

    // Helper to add link
    const addLink = (source: string, target: string, rel: string) => {
      links.push({ source, target, relationship: rel });
    };

    // 1. Check if the target is a Customer
    const custRes = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (custRes.rows.length > 0) {
      const c = custRes.rows[0];
      addNode({
        id: c.id,
        label: `${c.first_name} ${c.last_name}`,
        type: 'CUSTOMER',
        riskLevel: c.risk_tier,
        details: { phone: c.phone_masked, pan: c.pan_masked, kyc: c.kyc_status },
      });

      // Fetch customer's accounts
      const accRes = await db.query('SELECT * FROM accounts WHERE customer_id = $1', [c.id]);
      for (const a of accRes.rows) {
        addNode({
          id: a.id,
          label: a.account_number_masked,
          type: 'ACCOUNT',
          riskLevel: a.status === 'FROZEN' ? 'CRITICAL' : 'SAFE',
          details: { balance: a.balance, status: a.status, type: a.account_type },
        });
        addLink(c.id, a.id, 'OWNS');

        // Fetch transactions from this account
        const txRes = await db.query(`
          SELECT t.*, ra.risk_level, ra.risk_score 
          FROM transactions t
          LEFT JOIN risk_assessments ra ON t.id = ra.transaction_id
          WHERE t.account_id = $1
          LIMIT 10;
        `, [a.id]);

        for (const t of txRes.rows) {
          addNode({
            id: t.id,
            label: `${t.txn_reference} (₹${Number(t.amount).toLocaleString('en-IN')})`,
            type: 'TRANSACTION',
            riskLevel: t.risk_level || 'SAFE',
            details: { amount: t.amount, channel: t.channel, status: t.status },
          });
          addLink(a.id, t.id, 'DEBITED');

          // Add recipient node
          const recId = `REC-${t.recipient_identifier}`;
          addNode({
            id: recId,
            label: t.recipient_identifier,
            type: 'RECIPIENT_VPA',
            riskLevel: t.risk_level === 'CRITICAL' ? 'CRITICAL' : 'MEDIUM',
          });
          addLink(t.id, recId, 'TRANSFERRED_TO');
        }
      }

      // Fetch customer's linked devices
      const devRes = await db.query(`
        SELECT d.*, cd.is_primary 
        FROM devices d
        JOIN customer_devices cd ON d.id = cd.device_id
        WHERE cd.customer_id = $1;
      `, [c.id]);

      for (const d of devRes.rows) {
        addNode({
          id: d.id,
          label: `${d.device_type} (${d.os_version || 'OS'})`,
          type: 'DEVICE',
          riskLevel: d.is_rooted_or_jailbroken ? 'CRITICAL' : 'SAFE',
          details: { fingerprint: d.device_fingerprint, trustScore: d.trust_score, rooted: d.is_rooted_or_jailbroken },
        });
        addLink(c.id, d.id, 'LOGGED_IN_WITH');

        // Check if this device is ALSO linked to OTHER customers (MULE RING DISCOVERY!)
        const sharedDevRes = await db.query(`
          SELECT c2.id, c2.first_name, c2.last_name, c2.risk_tier 
          FROM customer_devices cd2
          JOIN customers c2 ON cd2.customer_id = c2.id
          WHERE cd2.device_id = $1 AND cd2.customer_id <> $2;
        `, [d.id, c.id]);

        for (const otherCust of sharedDevRes.rows) {
          addNode({
            id: otherCust.id,
            label: `[MULE SUSPECT] ${otherCust.first_name} ${otherCust.last_name}`,
            type: 'CUSTOMER',
            riskLevel: 'CRITICAL',
            details: { reason: 'SHARED HARDWARE SIGNATURE' },
          });
          addLink(d.id, otherCust.id, 'SHARED_DEVICE_CLUSTER');
        }
      }
    }

    // Return graph structure
    res.json({
      nodes: Array.from(nodes.values()),
      links,
      clusterSummary: {
        totalEntities: nodes.size,
        totalConnections: links.length,
        sharedHardwareDetected: links.some(l => l.relationship === 'SHARED_DEVICE_CLUSTER'),
      },
    });
  } catch (err) {
    console.error('[GRAPH_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to construct entity relationship graph.' });
  }
}

export async function getMuleRingClusters(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await db.query(`SELECT * FROM view_mule_ring_candidates;`);
    res.json({ clusters: result.rows });
  } catch (err) {
    console.error('[MULE_RING_ERROR]', err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to inspect mule rings.' });
  }
}
