import React, { useEffect, useRef, useState } from 'react';
import { LeafIcon, MailIcon, UserIcon, LockIcon, ShieldCheckIcon } from './Icons';
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

  // State for email verification modal
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ name: string; email: string; picture: string; } | null>(null);


  useEffect(() => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
      console.error("GOOGLE_CLIENT_ID is not set. Google Sign-In will not work.");
      setError("Google Sign-In is not configured for this site.");
      return;
    }

    if (typeof window.google === 'undefined' || !googleButtonRef.current) {
        return;
    }
    
    window.google.accounts.id.initialize({
      client_id: googleClientId,
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
      // Mock sign-up logic - logs in directly
      const mockUser = {
        name: name,
        email: email,
        picture: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`,
      };
      onLoginSuccess(mockUser);
    } else {
      // Mock sign-in logic - triggers verification
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }
      const userToVerify = {
        name: email.split('@')[0],
        email: email,
        picture: `https://api.dicebear.com/8.x/initials/svg?seed=${email}`,
      };
      setPendingUser(userToVerify);
      setIsVerificationVisible(true);
    }
  };

  const handleVerification = (code: string) => {
    // In a real app, you'd call a backend service. Here, we simulate it.
    if (code === '123456') {
      if (pendingUser) {
        onLoginSuccess(pendingUser);
      }
      setIsVerificationVisible(false);
      setPendingUser(null);
    } else {
      // Set an error message inside the modal
      return "Invalid verification code. Please try again.";
    }
    return ""; // No error
  };

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LeafIcon className="h-16 w-16 text-primary-600 mx-auto" />
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mt-4">Plants Doctor</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Your AI Farming Assistant</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
            {isSignUp ? 'Create an Account' : 'Sign In'}
          </h2>

          {error && <p className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded-md text-sm mb-4 text-center">{error}</p>}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>
            )}
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                required
              />
            </div>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          <div className="flex justify-center">
             <div ref={googleButtonRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
          </div>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-semibold text-primary-600 hover:underline">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
      {isVerificationVisible && (
        <VerificationModal
          onVerify={handleVerification}
          onClose={() => setIsVerificationVisible(false)}
          email={pendingUser?.email || ''}
        />
      )}
    </div>
  );
};


// Verification Modal Component
interface VerificationModalProps {
    onVerify: (code: string) => string;
    onClose: () => void;
    email: string;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ onVerify, onClose, email }) => {
    const [code, setCode] = useState('');
    const [modalError, setModalError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        const newCode = [...code.slice(0, index), value, ...code.slice(index + 1)].join('');
        
        if (/^[0-9]*$/.test(value) && value.length <= 1) {
            setCode(newCode.slice(0, 6));

            // Move to next input
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^[0-9]*$/.test(pastedData)) {
            setCode(pastedData);
             pastedData.split('').forEach((char, index) => {
                if(inputRefs.current[index]) {
                    (inputRefs.current[index] as HTMLInputElement).value = char;
                }
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setModalError('');
        if (code.length !== 6) {
            setModalError("Please enter a 6-digit code.");
            return;
        }
        const errorMsg = onVerify(code);
        if(errorMsg) {
            setModalError(errorMsg);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm m-4 text-center">
                <ShieldCheckIcon className="h-16 w-16 text-primary-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Check your email</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">We've sent a 6-digit code to <span className="font-semibold">{email}</span>. The code is <span className="font-bold text-primary-500">123456</span>.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <input
                                key={index}
                                // FIX: Corrected the ref callback to ensure it returns `void` as required by React's `Ref` type.
                                ref={el => { inputRefs.current[index] = el; }}
                                type="text"
                                maxLength={1}
                                value={code[index] || ''}
                                onChange={e => handleInputChange(e, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                required
                            />
                        ))}
                    </div>

                    {modalError && <p className="text-red-500 text-sm mb-4">{modalError}</p>}
                    
                    <div className="space-y-3">
                        <button type="submit" className="w-full py-3 px-4 rounded-lg bg-primary-600 text-white font-bold hover:bg-primary-700">Verify</button>
                        <button type="button" onClick={onClose} className="w-full py-2 px-4 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};