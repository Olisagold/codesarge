import type { AssessmentResult } from '@/lib/codeverity';
import { db, now } from '@/lib/db';
import { HttpError, route } from '@/lib/http';
import { markCompleted, markFailed } from '@/lib/submissions';
import { verifySignature } from '@/lib/webhooks';

type Event = { id: string; type: string; data: unknown };
type FailedData = { assessment_id: string; error: { code: string | null; message: string | null } };

export const POST = route(async (req) => {
  const secret = process.env.CODEVERITY_WEBHOOK_SECRET;
  if (!secret) throw new HttpError(503, 'Webhooks are not set up: CODEVERITY_WEBHOOK_SECRET is missing.');

  // Verify against the raw body, before parsing it.
  const raw = await req.text();
  if (!verifySignature(req.headers.get('codeverity-signature'), raw, secret)) {
    throw new HttpError(400, 'Invalid signature.');
  }
  const event = JSON.parse(raw) as Event;

  // Retries reuse the event id, so each event is applied once.
  const fresh = db()
    .prepare('INSERT OR IGNORE INTO webhook_events (id, received_at) VALUES (?, ?)')
    .run(event.id, now()).changes;
  if (!fresh) return Response.json({ received: true, duplicate: true });

  if (event.type === 'assessment.completed') {
    const data = event.data as AssessmentResult;
    markCompleted(data.assessment_id, data);
  } else if (event.type === 'assessment.failed') {
    const data = event.data as FailedData;
    markFailed(data.assessment_id, data.error.message ?? 'The assessment could not be completed.');
  }
  // Anything else, such as webhook.test, is acknowledged and ignored.
  return Response.json({ received: true });
});
