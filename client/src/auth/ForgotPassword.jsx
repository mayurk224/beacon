import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bolt, AlertCircle, Mail, Loader2, CheckCircle } from "lucide-react";
import { authApi } from "./authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await authApi.post("/api/auth/forgot-password", { email });
      setSuccess(response.data.message || "If this email exists, a reset link has been sent.");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "An error occurred. Please try again.";
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
            Reset your password
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-header border border-border-muted rounded-lg p-6 flex flex-col gap-4">
          {success && (
            <div className="bg-semantic-success/12 border border-semantic-success/30 rounded p-3 flex gap-2">
              <CheckCircle className="w-5 h-5 text-success-bright" />
              <p className="text-[13px] text-success-bright">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-semantic-error/10 border border-semantic-error/25 rounded p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-danger-soft mt-0.5 shrink-0" />
              <p className="text-[13px] leading-4.5 font-medium text-danger-soft">
                {error}
              </p>
            </div>
          )}

          {!success && (
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

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Reset Link
              </button>
            </form>
          )}

          <div className="text-center mt-2">
            <p className="text-[12px] text-subtle">
              Remember your password?{" "}
              <Link
                to="/signin"
                className="text-brand-soft hover:text-brand-strong font-medium transition-colors"
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

export default ForgotPassword;
