import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Loader2 } from "lucide-react";

function WelcomeScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      sessionStorage.removeItem("chatifyShowWelcome");
      navigate("/chat", { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome-screen">
      <div className="welcome-screen__background" />
      <div className="welcome-screen__content">
        <div className="welcome-screen__icon-wrap">
          <ShieldCheck className="welcome-screen__icon" />
        </div>

        <h1 className="welcome-screen__title">Welcome to Chatify</h1>
        <p className="welcome-screen__subtitle">Quantum Encrypted Chat Application</p>

        <div className="welcome-screen__loader-wrap">
          <Loader2 className="welcome-screen__loader" />
          <span className="welcome-screen__loader-text">Initializing Secure Connection...</span>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
