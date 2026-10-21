// Temporary Phase 4 failure-path verification. Removed after the hosted run.
export const phase04WrongType: string = 123;
const phase04Unused = 'deliberate lint violation';

it('rejects a deliberate CI assertion failure', () => {
  expect(1).toBe(2);
});
