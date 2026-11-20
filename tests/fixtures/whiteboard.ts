import * as Y from 'yjs';
import { encode } from '@/modules/whiteboard/document';
import type { BoardSync } from '@/modules/whiteboard/schema';
export const boardId = '22222222-2222-4222-8222-222222222222';
export const boardSessionId = '11111111-1111-4111-8111-111111111111';
export const boardEpoch = '33333333-3333-4333-8333-333333333333';
export function boardSync(canEdit = false): BoardSync {
  const doc = new Y.Doc();
  doc.getMap('shapes');
  const binary = encode(Y.encodeStateAsUpdate(doc));
  doc.destroy();
  return {
    board: {
      id: boardId,
      sessionId: boardSessionId,
      title: 'Session board',
      epoch: boardEpoch,
      mode: 'PRESENTATION',
      sequence: '0',
      controlVersion: '1',
      schemaVersion: 2,
      lastPersistedAt: null,
    },
    capabilities: {
      canView: true,
      canCreate: false,
      canEdit,
      canControl: false,
      canUpload: false,
      canSnapshot: false,
      canRestore: false,
      canExport: false,
      canCollaborate: false,
    },
    binary,
    identity: { id: boardSessionId, name: 'Student' },
  };
}
