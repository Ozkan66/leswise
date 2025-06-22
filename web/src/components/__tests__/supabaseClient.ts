const chain = {
  select:      () => chain,
  eq:          () => chain,                // keeps legacy tests happy
  match:       () => chain,                // new v2 code path
  single:      () => Promise.resolve({ data: null, error: null }),
  maybeSingle: () => Promise.resolve({ data: null, error: null }),
  rpc:         () => Promise.resolve({ data: null, error: null }),
};

export const supabase = {
  from: () => chain,
  auth: { getUser: () => Promise.resolve({ data: { user: { id: '1' } } }) },
};
