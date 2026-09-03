import { describe, it, expect } from 'vitest';
import { ComplaintStatusType } from '../types/complaint';

function getNextAllowedStatus(currentStatus: ComplaintStatusType): ComplaintStatusType | null {
  switch (currentStatus) {
    case 'SUBMITTED':
      return 'ASSIGNED';
    case 'ASSIGNED':
      return 'IN_PROGRESS';
    case 'IN_PROGRESS':
      return 'RESOLVED';
    case 'RESOLVED':
      return null;
    default:
      return null;
  }
}

function isValidStatusTransition(from: ComplaintStatusType, to: ComplaintStatusType): boolean {
  const allowed = getNextAllowedStatus(from);
  return allowed === to;
}

describe('Complaint Status Lifecycle Logic', () => {
  it('enforces sequential progression from SUBMITTED to RESOLVED', () => {
    expect(getNextAllowedStatus('SUBMITTED')).toBe('ASSIGNED');
    expect(getNextAllowedStatus('ASSIGNED')).toBe('IN_PROGRESS');
    expect(getNextAllowedStatus('IN_PROGRESS')).toBe('RESOLVED');
    expect(getNextAllowedStatus('RESOLVED')).toBeNull(); // Terminal state
  });

  it('rejects invalid or skipping transitions', () => {
    expect(isValidStatusTransition('SUBMITTED', 'IN_PROGRESS')).toBe(false);
    expect(isValidStatusTransition('SUBMITTED', 'RESOLVED')).toBe(false);
    expect(isValidStatusTransition('ASSIGNED', 'RESOLVED')).toBe(false);
    expect(isValidStatusTransition('RESOLVED', 'SUBMITTED')).toBe(false);
    expect(isValidStatusTransition('RESOLVED', 'IN_PROGRESS')).toBe(false);
  });

  it('allows valid sequential transitions', () => {
    expect(isValidStatusTransition('SUBMITTED', 'ASSIGNED')).toBe(true);
    expect(isValidStatusTransition('ASSIGNED', 'IN_PROGRESS')).toBe(true);
    expect(isValidStatusTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
  });
});
