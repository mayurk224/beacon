import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { authApi } from "./authApi";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_INIT_RETRIES = 20;
const GOOGLE_INIT_DELAY_MS = 300;

const GoogleSignInButton = ({
  label = "Continue with Google",
  onSuccess,
  onError,
  disabled = false,
}) => {
  const containerRef = useRef(null);
  const initializedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let retryTimeout;

    const initializeGoogle = (attempt = 0) => {
      if (!containerRef.current || initializedRef.current) {
        return;
      }

      if (!GOOGLE_CLIENT_ID) {
        onError?.("Google sign-in is not configured for this environment.");
        return;
      }

      const google = window.google?.accounts?.id;
      if (!google) {
        if (attempt >= GOOGLE_INIT_RETRIES) {
          onError?.("Google sign-in is unavailable right now. Please try again.");
          return;
        }

        retryTimeout = window.setTimeout(() => {
          initializeGoogle(attempt + 1);
        }, GOOGLE_INIT_DELAY_MS);
        return;
      }

      google.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response.credential) {
            onError?.("Google did not return a sign-in credential.");
            return;
          }

          setIsSubmitting(true);

          try {
            const { data } = await authApi.post("/google", {
              credential: response.credential,
            });

            localStorage.setItem("isAuthenticated", "true");
            onSuccess?.(data.user);
          } catch (error) {
            const message =
              error.response?.data?.message ||
              "Google sign-in failed. Please try again.";
            onError?.(message);
          } finally {
            setIsSubmitting(false);
          }
        },
      });

      containerRef.current.innerHTML = "";
      google.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        shape: "rectangular",
        text: "continue_with",
        width: 332,
      });

      initializedRef.current = true;
    };

    initializeGoogle();

    return () => {
      if (retryTimeout) {
        window.clearTimeout(retryTimeout);
      }
    };
  }, [onError, onSuccess]);

  return (
    <div className="flex min-h-[42px] items-center justify-center rounded">
      {isSubmitting ? (
        <div className="flex items-center gap-2 text-[13px] text-[#c2c6d6]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{label}</span>
        </div>
      ) : (
        <div
          ref={containerRef}
          className={disabled ? "pointer-events-none opacity-60" : ""}
        />
      )}
    </div>
  );
};

export default GoogleSignInButton;
