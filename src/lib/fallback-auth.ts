/**
 * Serviciu de autentificare de rezervă pentru situațiile în care Supabase nu răspunde
 * NOTĂ: Acest serviciu este doar pentru dezvoltare și testare, nu pentru producție
 */

// Utilizatori de test pentru dezvoltare
const testUsers = [
  {
    id: 'test-user-1',
    email: 'robialexzi0@gmail.com',
    password: 'password123',
    displayName: 'Alex Test',
    role: 'admin'
  },
  {
    id: 'test-user-2',
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User',
    role: 'user'
  }
];

// Sesiune simulată
interface FallbackSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// Răspuns simulat
interface FallbackResponse<T> {
  data: T | null;
  error: Error | null;
  status: 'success' | 'error';
}

export const fallbackAuth = {
  /**
   * Autentificare de rezervă
   * @param email Email-ul utilizatorului
   * @param password Parola utilizatorului
   * @returns Răspuns simulat cu sesiune sau eroare
   */
  async signIn(email: string, password: string): Promise<FallbackResponse<{ session: FallbackSession, user: any }>> {
    console.log('Using fallback authentication for:', email);
    
    // Simulăm o întârziere pentru a face autentificarea să pară reală
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Căutăm utilizatorul în lista de utilizatori de test
    const user = testUsers.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      console.log('Fallback auth: Invalid credentials');
      return {
        data: null,
        error: new Error('Invalid email or password'),
        status: 'error'
      };
    }
    
    // Creăm o sesiune simulată
    const session: FallbackSession = {
      access_token: `fake-token-${Math.random().toString(36).substring(2)}`,
      refresh_token: `fake-refresh-${Math.random().toString(36).substring(2)}`,
      expires_at: Date.now() + 3600 * 1000, // Expiră în 1 oră
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
    
    console.log('Fallback auth: Authentication successful');
    
    return {
      data: {
        session,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      },
      error: null,
      status: 'success'
    };
  },
  
  /**
   * Verifică dacă există o sesiune activă
   * @returns Răspuns simulat cu sesiune sau null
   */
  async getSession(): Promise<FallbackResponse<{ session: FallbackSession }>> {
    // Verificăm dacă există o sesiune în localStorage
    const sessionStr = localStorage.getItem('fallback_session');
    
    if (!sessionStr) {
      return {
        data: null,
        error: null,
        status: 'success'
      };
    }
    
    try {
      const session = JSON.parse(sessionStr) as FallbackSession;
      
      // Verificăm dacă sesiunea a expirat
      if (session.expires_at < Date.now()) {
        localStorage.removeItem('fallback_session');
        return {
          data: null,
          error: null,
          status: 'success'
        };
      }
      
      return {
        data: { session },
        error: null,
        status: 'success'
      };
    } catch (error) {
      localStorage.removeItem('fallback_session');
      return {
        data: null,
        error: new Error('Invalid session'),
        status: 'error'
      };
    }
  },
  
  /**
   * Deconectare
   * @returns Răspuns simulat
   */
  async signOut(): Promise<FallbackResponse<null>> {
    localStorage.removeItem('fallback_session');
    
    return {
      data: null,
      error: null,
      status: 'success'
    };
  },
  
  /**
   * Obține profilul utilizatorului
   * @param userId ID-ul utilizatorului
   * @returns Răspuns simulat cu profilul utilizatorului
   */
  async getUserProfile(userId: string): Promise<FallbackResponse<any>> {
    const user = testUsers.find(u => u.id === userId);
    
    if (!user) {
      return {
        data: null,
        error: new Error('User not found'),
        status: 'error'
      };
    }
    
    return {
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      },
      error: null,
      status: 'success'
    };
  }
};

export default fallbackAuth;
