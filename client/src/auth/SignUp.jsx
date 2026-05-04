import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bolt,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { authApi } from "./authApi";
import GoogleSignInButton from "./GoogleSignInButton";
import { useAuth } from "./useAuth";

const SignUp = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateForm = () => {
    if (!name || !email || !password || !passwordConfirmation) {
      setError("All fields are required.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain uppercase, lowercase, number, and special character.",
      );
      return false;
    }
    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await authApi.post("/api/auth/signup", {
        name,
        email,
        password,
        passwordConfirmation,
      });

      setSuccess(response.data.message || "Account created successfully!");
      window.setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Failed to create account. Please try again.";
      setError(msg);
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
            <h1 className="text-[24px] font-semibold">Beacon</h1>
          </div>
          <p className="text-[13px] text-tertiary">
            Create your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-header border border-border-muted rounded-lg p-6 flex flex-col gap-4 ">

          {/* Success */}
          {success && (
            <div className="bg-semantic-success/12 border border-semantic-success/30 rounded p-3 flex gap-2">
              <CheckCircle className="w-5 h-5 text-success-bright" />
              <p className="text-[13px] text-success-bright">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-semantic-error/10 border border-semantic-error/25 rounded p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-danger-soft" />
              <p className="text-[13px] text-danger-soft">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase text-tertiary">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-elevated border border-border-muted rounded pl-9 pr-3 py-2 text-[13px] focus:border-brand-soft outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase text-tertiary">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-elevated border border-border-muted rounded pl-9 pr-3 py-2 text-[13px] focus:border-brand-soft outline-none"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase text-tertiary">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-elevated border border-border-muted rounded pl-9 pr-9 py-2 text-[13px] focus:border-brand-soft outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase text-tertiary">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full bg-surface-elevated border border-border-muted rounded pl-9 pr-3 py-2 text-[13px] focus:border-brand-soft outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-border-muted flex-1"></div>
            <span className="text-[11px] text-tertiary uppercase">Or</span>
            <div className="h-px bg-border-muted flex-1"></div>
          </div>

          <GoogleSignInButton
            label="Signing in with Google"
            disabled={isLoading}
            onSuccess={async (credential) => {
              await loginWithGoogle(credential);
              navigate("/home");
            }}
            onError={setError}
          />

          <div className="text-center mt-2">
            <p className="text-[12px] text-subtle">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-brand-soft hover:text-brand-strong"
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
