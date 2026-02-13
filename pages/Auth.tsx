
import * as React from 'react';
import { useState, type FC } from 'react';
import { User } from '../types';

interface AuthProps {
  mode: 'login' | 'register';
  navigate: (page: string) => void;
  onLogin: (email: string, pass: string) => Promise<User>;
}

const Auth: FC<AuthProps> = ({ mode, navigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      try {
        await onLogin(email, password);
        console.log("[AUTH] Autenticazione completata. Reindirizzamento alla galleria pacchetti.");
        navigate('packages');
      } catch (error: any) {
        alert("Errore Autenticazione: " + (error.message || "Email o password non corretti."));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 transition-colors px-6 py-12">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif mb-2 dark:text-white">{mode === 'login' ? 'Accesso' : 'Crea Account'}</h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {mode === 'login' 
              ? 'Accedi per gestire i tuoi ordini o il pannello fotografico.' 
              : 'Registrati per iniziare a stampare i tuoi ricordi.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Nome Completo</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-gray-50 dark:bg-zinc-800 dark:text-white border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                placeholder="Nome e Cognome"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-zinc-800 dark:text-white border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              placeholder="email@esempio.it"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-zinc-800 dark:text-white border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-black dark:bg-white dark:text-black text-white rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-200 shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading ? 'Attendi...' : (mode === 'login' ? 'Entra ora' : 'Registrati')}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {mode === 'login' ? "Non hai un account?" : "Hai già un account?"}
            <button 
              onClick={() => navigate(mode === 'login' ? 'register' : 'login')}
              className="ml-2 font-bold text-black dark:text-white hover:underline"
            >
              {mode === 'login' ? 'Registrati ora' : 'Accedi'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;