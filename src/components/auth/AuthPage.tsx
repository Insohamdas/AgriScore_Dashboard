import React, { Suspense, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, Wheat, Droplets, Sun, Sprout } from 'lucide-react';

const ThreeBackground = React.lazy(() => import('./ThreeBackground'));

interface AuthPageProps {
  onContinueDemo?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onContinueDemo }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const { signIn, signUp, resetPassword, signInWithGoogle, signInWithFacebook, isConfigured } = useAuth();

  const isNetworkFetchError = (msg: string) => {
    const text = (msg || '').toLowerCase();
    return text.includes('failed to fetch') || text.includes('networkerror') || text.includes('load failed');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccessMessage('Password reset link sent! Check your email inbox.');
          setIsForgotPassword(false);
          setIsLogin(true);
        }
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setSuccessMessage('Account created! Check your email to verify.');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Demo mode
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-amber-100">
          <div className="text-center mb-8">
            <img src="/logo.svg" alt="AgriScore" className="w-36 h-36 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900">AgriScore Dashboard</h1>
            <p className="text-slate-500 mt-2">Demo Mode</p>
          </div>
          <button
            onClick={() => {
              if (onContinueDemo) {
                onContinueDemo();
                return;
              }
              window.location.reload();
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-green-600 hover:from-amber-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#1a3a2e]">
      {/* Left Panel - Three.js Farming Animation */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <Suspense fallback={null}>
          <ThreeBackground />
        </Suspense>
        
        {/* Gradient Overlay - darker for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-[#1a3a2e]/80 z-5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a2e]/60 via-transparent to-black/20 z-5" />
        
        {/* Overlay Content */}
        <div className={`relative z-10 flex flex-col justify-between p-12 text-white w-full transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="AgriScore" className="w-32 h-32 drop-shadow-2xl" />
          </div>

          {/* Center Content - More Emotional */}
          <div className="max-w-lg space-y-8">
            <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Sun className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold text-white">Every Sunrise, New Hope</span>
            </div>
            
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">
              Where Dreams<br/>
              <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
                Take Root
              </span>
            </h1>
            
            <p className="text-white text-lg leading-relaxed max-w-md italic drop-shadow-md">
              "The farmer is the only man in our economy who buys everything at retail, sells everything at wholesale, and pays the freight both ways." — We're here to change that.
            </p>

            {/* Emotional Feature Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 px-4 py-3 bg-black/30 backdrop-blur-sm rounded-xl border border-white/30">
                <Droplets className="w-5 h-5 text-cyan-300 flex-shrink-0" />
                <span className="text-sm font-medium text-white whitespace-nowrap">Nurturing Rain</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-black/30 backdrop-blur-sm rounded-xl border border-white/30">
                <Sun className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                <span className="text-sm font-medium text-white whitespace-nowrap">Golden Sunlight</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-black/30 backdrop-blur-sm rounded-xl border border-white/30">
                <Sprout className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <span className="text-sm font-medium text-white whitespace-nowrap">Growing Dreams</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-black/30 backdrop-blur-sm rounded-xl border border-white/30">
                <Wheat className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-sm font-medium text-white whitespace-nowrap">Harvest of Hope</span>
              </div>
            </div>
          </div>

          {/* Footer Stats - Startup Vision */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center hover:bg-white/20 transition-all duration-300 group cursor-default">
              <div className="text-lg font-bold text-yellow-300 drop-shadow-md mb-1 group-hover:scale-105 transition-transform">Data Driven</div>
              <div className="text-white/90 text-xs font-medium">Precision Farming</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center hover:bg-white/20 transition-all duration-300 group cursor-default">
              <div className="text-lg font-bold text-emerald-300 drop-shadow-md mb-1 group-hover:scale-105 transition-transform">Sustainable</div>
              <div className="text-white/90 text-xs font-medium">Eco-Friendly</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center hover:bg-white/20 transition-all duration-300 group cursor-default">
              <div className="text-lg font-bold text-orange-300 drop-shadow-md mb-1 group-hover:scale-105 transition-transform">Scalable</div>
              <div className="text-white/90 text-xs font-medium">Future Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
        <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <img src="/logo.svg" alt="AgriScore" className="w-36 h-36 mx-auto" />
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800">
              {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Home, Farmer' : 'Begin Your Journey'}
            </h2>
            <p className="text-slate-500 mt-3">
              {isForgotPassword ? 'Enter your email and we\'ll send you a reset link' : isLogin ? 'Your fields are waiting for you' : 'Plant the seeds of tomorrow, today'}
            </p>
          </div>

          {/* Forgot Password Helper */}
          {isForgotPassword && !successMessage && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">Reset your password</p>
                  <p className="text-xs text-amber-800 leading-relaxed mt-1">
                    Enter your registered email address below to receive a secure password reset link.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {error && isNetworkFetchError(error) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800 font-semibold mb-2">Login service unreachable</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                This usually means your `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` is missing/incorrect, or the network is blocking requests to Supabase.
                You can continue in demo mode while you fix the env.
              </p>
              {onContinueDemo && (
                <button
                  type="button"
                  onClick={onContinueDemo}
                  className="mt-3 w-full bg-gradient-to-r from-amber-500 to-green-600 hover:from-amber-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Continue to Dashboard (Demo)
                </button>
              )}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {/* Social Buttons - Hide on forgot password */}
          {!isForgotPassword && (
          <div className="space-y-4 mb-8">
            {/* Coming Soon Message */}
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm mb-1">OAuth Setup in Progress</p>
                  <p className="text-xs text-blue-700 leading-relaxed">We're currently setting up Google and Facebook authentication. Please use email and password to login for now. OAuth will be available soon!</p>
                </div>
              </div>
            </div>

            {/* Social Buttons - Disabled State */}
            <div className="flex gap-4">
              <button 
                type="button"
                disabled
                title="Google Sign-in coming soon"
                className="flex-1 flex items-center justify-center gap-3 py-3.5 bg-slate-100 border-2 border-slate-200 rounded-xl opacity-50 cursor-not-allowed text-slate-600 font-medium shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button 
                type="button"
                disabled
                title="Facebook Sign-in coming soon"
                className="flex-1 flex items-center justify-center gap-3 py-3.5 bg-slate-100 border-2 border-slate-200 rounded-xl opacity-50 cursor-not-allowed text-slate-600 font-medium shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && !isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rohit Kumar"
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {!isForgotPassword && (
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                {isLogin && !isForgotPassword && (
                  <button 
                    type="button" 
                    onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMessage(''); }}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-slate-800 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-green-600 hover:from-orange-600 hover:via-amber-600 hover:to-green-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Return to My Fields' : 'Plant My First Seed'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-slate-600 mt-8">
            {isForgotPassword ? (
              <>
                Remember your password?{' '}
                <button
                  onClick={() => { setIsForgotPassword(false); setIsLogin(true); setError(''); setSuccessMessage(''); }}
                  className="text-orange-600 hover:text-orange-700 font-semibold"
                >
                  Back to Sign In
                </button>
              </>
            ) : isLogin ? (
              <>
                New to the farm?{' '}
                <button
                  onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
                  className="text-orange-600 hover:text-orange-700 font-semibold"
                >
                  Join the Family
                </button>
              </>
            ) : (
              <>
                Already part of our family?{' '}
                <button
                  onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
                  className="text-orange-600 hover:text-orange-700 font-semibold"
                >
                  Welcome Back
                </button>
              </>
            )}
          </p>

          {/* Trust - More Emotional */}
          <div className="mt-10 pt-6 border-t border-orange-200/30 w-full flex items-center justify-center gap-2 sm:gap-4 text-slate-500 text-[10px] sm:text-xs font-medium">
            <span className="flex items-center gap-1 whitespace-nowrap">🚀 Smart Farming</span>
            <span className="w-px h-3 bg-slate-300/50"></span>
            <span className="flex items-center gap-1 whitespace-nowrap">🛡️ 100% Secure</span>
            <span className="w-px h-3 bg-slate-300/50"></span>
            <span className="flex items-center gap-1 whitespace-nowrap">💚 Made with Love</span>
            <span className="w-px h-3 bg-slate-300/50"></span>
            <span className="flex items-center gap-1 whitespace-nowrap">🇮🇳 Proudly Indian</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
