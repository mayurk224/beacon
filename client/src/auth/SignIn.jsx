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
    <div className="bg-surface-inset text-primary min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Bolt className="w-7 h-7 text-brand-soft" />
            <h1 className="text-[24px] leading-8 tracking-[-0.02em] font-semibold text-primary">
              Beacon
            </h1>
          </div>
          <p className="text-[13px] leading-4.5 font-medium text-tertiary">
            Sign in to your workspace
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-header border border-border-muted rounded-lg p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-semantic-error/10 border border-semantic-error/25 rounded p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-danger-soft mt-0.5 shrink-0" />
              <p className="text-[13px] leading-4.5 font-medium text-danger-soft">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-tertiary uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-elevated border border-border-muted rounded pl-9 pr-3 py-2 text-[13px] text-primary focus:border-brand-soft focus:outline-none"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-elevated border border-border-muted rounded pl-9 pr-9 py-2 text-[13px] text-primary focus:border-brand-soft focus:outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-[12px] text-tertiary">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border border-border-primary bg-surface-card accent-brand-strong"
              />
              Remember my email
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-border-muted flex-1"></div>
            <span className="text-[11px] font-medium text-tertiary uppercase">
              Or
            </span>
            <div className="h-px bg-border-muted flex-1"></div>
          </div>

          <GoogleSignInButton
            label="Signing in with Google"
            disabled={isLoading}
            onSuccess={() => navigate("/home")}
            onError={setError}
          />

          <div className="text-center mt-2">
            <p className="text-[12px] text-subtle">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-brand-soft hover:text-brand-strong font-medium transition-colors"
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
