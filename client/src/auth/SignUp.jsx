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

const SignUp = () => {
  const navigate = useNavigate();

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
      const response = await authApi.post("/signup", {
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
    <div className="bg-[#0c0e0f] text-[#e2e2e3] min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Bolt className="w-7 h-7 text-[#afc6ff]" />
            <h1 className="text-[24px] font-semibold">Beacon</h1>
          </div>
          <p className="text-[13px] text-[#c2c6d6]">Create your account</p>
        </div>

        <div className="bg-[#121415] border border-[#424753] rounded-lg p-6 flex flex-col gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          {success && (
            <div className="bg-[#162d1b] border border-[#2b5c32] rounded p-3 flex gap-2">
              <CheckCircle className="w-5 h-5 text-[#b4ffab]" />
              <p className="text-[13px] text-[#b4ffab]">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-[#2D1616] border border-[#5C2B2B] rounded p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-[#ffb4ab]" />
              <p className="text-[13px] text-[#ffb4ab]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  placeholder="********"
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

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase text-[#c2c6d6]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c909f]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full bg-[#1a1c1d] border border-[#424753] rounded pl-9 pr-3 py-2 text-[13px] focus:border-[#afc6ff] outline-none"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1a1a1a] text-[#fff] text-[14px] font-medium rounded py-2.5 mt-2 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-[#424753] flex-1"></div>
            <span className="text-[11px] text-[#c2c6d6] uppercase">Or</span>
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
              Already have an account?{" "}
              <Link to="/signin" className="text-[#afc6ff] hover:text-[#528dff]">
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
