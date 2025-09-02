import React, { useEffect, useRef, useState } from 'react';
import { LeafIcon, MailIcon, UserIcon, LockIcon } from './Icons';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

// A simple client-side JWT decoder
function decodeJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("Error decoding JWT", e);
    return null;
  }
}

declare global {
    interface Window {
        google: any;
    }
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // The conditional check for process.env.GOOGLE_CLIENT_ID has been removed.
    // The app now assumes this environment variable is always available.
    if (typeof window.google === 'undefined' || !googleButtonRef.current) {
        return;
    }
    
    window.google.accounts.id.initialize({
      client_id: process.env.GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        const userData = decodeJwt(response.credential);
        if (userData) {
          onLoginSuccess({
            name: userData.name,
            email: userData.email,
            picture: userData.picture,
          });
        } else {
            setError("Could not verify Google Sign-In. Please try again.");
        }
      },
    });

    window.google.accounts.id.renderButton(
      googleButtonRef.current,
      { theme: 'outline', size: 'large', type: 'standard', text: 'continue_with', width: '300' }
    );
    
  }, [onLoginSuccess]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (!name || !email || !password) {
        setError("Please fill in all fields to sign up.");
        return;
      }
      // Mock sign-up logic
      const mockUser = {
        name: name,
        email: email,
        picture: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`,
      };
      onLoginSuccess(mockUser);
    } else {
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }
      // Mock sign-in logic
      const mockUser = {
        name: email.split('@')[0],
        email: email,
        picture: `https://api.dicebear.com/8.x/initials/svg?seed=${email}`,
      };
      onLoginSuccess(mockUser);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-sm w-full text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <LeafIcon className="h-16 w-16 text-primary-600 mx-auto" />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mt-4">Plants Doctor</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Your AI-powered farming companion.</p>
        
        <div className="mt-8 flex justify-center">
            {/* The Google Sign-In button is now rendered directly, assuming the client ID is configured. */}
            <div ref={googleButtonRef}></div>
        </div>
        
        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
            {isSignUp && (
                <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-gray-50 dark:bg-gray-700"
                        required
                    />
                </div>
            )}
            <div className="relative">
                <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                    type="email" 
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-gray-50 dark:bg-gray-700"
                    required
                />
            </div>
             <div className="relative">
                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-gray-50 dark:bg-gray-700"
                    required
                />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors shadow-lg">
                {isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
            </button>
        </form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-medium text-primary-600 hover:underline ml-1">
                {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
        </p>
      </div>
    </div>
  );
};