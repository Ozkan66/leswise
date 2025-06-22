const chain: any = {};

// build a self-returning query-builder so every method can be chained
[
  'select',
  'eq',
  'match',
  'in',
  'filter',
  'order',
  'single',
  'maybeSingle',
  'update',
  'delete',
].forEach((fn) => {
  // `.order()` should finish the chain and resolve with { data, error }
  chain[fn] =
    fn === 'order'
      ? jest.fn(() => Promise.resolve({ data: [], error: null }))
      : jest.fn(() => chain);
});

export const supabase = {
  from: jest.fn(() => chain),
  rpc:  jest.fn(() => Promise.resolve({ data: null, error: null })),
  auth: {
    getUser: jest.fn(() =>
      Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })
    ),
  },
};
