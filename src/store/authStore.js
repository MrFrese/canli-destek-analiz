// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bcrypt from 'bcryptjs';

// Örnek admin kullanıcısı (gerçek uygulamada veritabanından gelmelidir)
const DEFAULT_ADMIN = {
  id: '1',
  username: 'admin',
  // "admin123" şifresinin hash'i
  passwordHash: '$2a$10$Xw4aHzTDfWMIeUYpOqH1IO4Vt/BXTGrjwXL8h2hNWAjWUWZ7ZM3je',
  role: 'admin'
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loginError: null,
      
      // Giriş işlemi
      login: async (username, password) => {
        // Gerçek uygulamada API'den doğrulama yapılır
        if (username === DEFAULT_ADMIN.username) {
          const isValid = await bcrypt.compare(password, DEFAULT_ADMIN.passwordHash);
          
          if (isValid) {
            set({ 
              user: { id: DEFAULT_ADMIN.id, username, role: DEFAULT_ADMIN.role },
              isAuthenticated: true,
              loginError: null
            });
            return true;
          }
        }
        
        set({ loginError: 'Kullanıcı adı veya şifre hatalı!' });
        return false;
      },
      
      // Çıkış işlemi
      logout: () => {
        set({ user: null, isAuthenticated: false, loginError: null });
      },
      
      // Şu anki kullanıcıyı kontrol etme
      checkAuth: () => {
        return get().isAuthenticated;
      }
    }),
    {
      name: 'auth-storage', // Local storage anahtar adı
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;