// Mock for supabase client
export const supabase = {
  auth: {
    signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
    getUser: jest.fn().mockResolvedValue({ 
      data: { 
        user: { 
          id: 'user123', 
          email: 'test@example.com' 
        } 
      }, 
      error: null 
    }),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  then: jest.fn().mockImplementation(callback => callback({ data: [], error: null })),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'avatars/user123.jpg' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: '{process.env.EXAMPLE_COM_AVATARS_USER123}' } }),
    }),
  },
};
