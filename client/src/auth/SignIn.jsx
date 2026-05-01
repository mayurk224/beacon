import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bolt,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
} from "lucide-react";
import { authApi } from "./authApi";
import GoogleSignInButton from "./GoogleSignInButton";

const SignIn = () => {
  const rememberedEmail = localStorage.getItem("rememberedEmail") || "";
  const navigate = useNavigate();
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authApi.post("/login", { email, password });

      localStorage.setItem("isAuthenticated", "true");
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate("/home");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Unable to sign in right now. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0c0e0f] text-[#e2e2e3] min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Bolt className="w-7 h-7 text-[#afc6ff]" />
            <h1 className="text-[24px] leading-[32px] tracking-[-0.02em] font-semibold text-[#e2e2e3]">
              Beacon
            </h1>
          </div>
          <p className="text-[13px] leading-[18px] font-medium text-[#c2c6d6]">
            Sign in to your workspace
          </p>
        </div>

        <div className="bg-[#121415] border border-[#424753] rounded-lg p-6 flex flex-col gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          {error && (
            <div className="bg-[#2D1616] border border-[#5C2B2B] rounded p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-[#ffb4ab] mt-0.5 flex-shrink-0" />
              <p className="text-[13px] leading-[18px] font-medium text-[#ffb4ab]">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#c2c6d6] uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c909f]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1a1c1d] border border-[#424753] rounded pl-9 pr-3 py-2 text-[13px] text-[#e2e2e3] focus:border-[#afc6ff] focus:outline-none"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c909f]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a1c1d] border border-[#424753] rounded pl-9 pr-9 py-2 text-[13px] text-[#e2e2e3] focus:border-[#afc6ff] focus:outline-none"
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c909f] hover:text-[#e2e2e3]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-[12px] text-[#c2c6d6]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border border-[#424753] bg-[#1a1c1d]"
              />
              Remember my email
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1a1a1a] text-[#FFF] text-[14px] font-medium rounded py-2.5 mt-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-[#424753] flex-1"></div>
            <span className="text-[11px] font-medium text-[#c2c6d6] uppercase">
              Or
            </span>
            <div className="h-px bg-[#424753] flex-1"></div>
          </div>

          <GoogleSignInButton
            label="Signing in with Google"
            disabled={isLoading}
            onSuccess={() => navigate("/home")}
            onError={setError}
          />

          <div className="text-center mt-2">
            <p className="text-[12px] text-[#8c909f]">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-[#afc6ff] hover:text-[#528dff] font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
