import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bolt,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Loader2,
} from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (name && email && password.length >= 6) {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/home');
      } else {
        setError('Please fill all fields correctly (min 6 char password).');
      }
      setIsLoading(false);
    }, 1000);
  };

 const handleGoogleSignIn = () => {
    setIsLoading(true);
    window.location.href =
      'https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=email profile';
  };

  return (
    <div className="bg-[#0c0e0f] text-[#e2e2e3] min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] flex flex-col gap-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Bolt className="w-7 h-7 text-[#afc6ff]" />
            <h1 className="text-[24px] font-semibold">Beacon</h1>
          </div>
          <p className="text-[13px] text-[#c2c6d6]">
            Create your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#121415] border border-[#424753] rounded-lg p-6 flex flex-col gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

          {/* Error */}
          {error && (
            <div className="bg-[#2D1616] border border-[#5C2B2B] rounded p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-[#ffb4ab]" />
              <p className="text-[13px] text-[#ffb4ab]">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase text-[#c2c6d6]">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c909f]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1a1c1d] border border-[#424753] rounded pl-9 pr-3 py-2 text-[13px] focus:border-[#afc6ff] outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase text-[#c2c6d6]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c909f]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1a1c1d] border border-[#424753] rounded pl-9 pr-3 py-2 text-[13px] focus:border-[#afc6ff] outline-none"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase text-[#c2c6d6]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c909f]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a1c1d] border border-[#424753] rounded pl-9 pr-9 py-2 text-[13px] focus:border-[#afc6ff] outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c909f]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1a1a1a] text-[#fff] text-[14px] font-medium rounded py-2.5 mt-2 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-[#424753] flex-1"></div>
            <span className="text-[11px] text-[#c2c6d6] uppercase">Or</span>
            <div className="h-px bg-[#424753] flex-1"></div>
          </div>

          {/* Google */}
           <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 text-[14px] font-medium rounded py-2.5 transition-colors flex items-center justify-center gap-3 border border-gray-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-2">
            <p className="text-[12px] text-[#8c909f]">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-[#afc6ff] hover:text-[#528dff]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;