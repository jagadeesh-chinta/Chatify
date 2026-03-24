import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageCircleIcon, MailIcon, LoaderIcon, LockIcon, UserIcon } from "lucide-react";
import toast from "react-hot-toast";

const loginFields = [
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    icon: MailIcon,
  },
  {
    key: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    icon: LockIcon,
  },
];

const signupFields = [
  {
    key: "fullName",
    label: "Username",
    type: "text",
    placeholder: "Enter your username",
    icon: UserIcon,
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    icon: MailIcon,
  },
  {
    key: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    icon: LockIcon,
  },
];

const infoSlides = [
  {
    title: "Real-Time Secure Messaging",
    description:
      "Chat, connect, and communicate with end-to-end secure features and modern UI experience.",
    subTitle: "Secure Real-Time Chat Application",
    subDescription:
      "Experience secure messaging with advanced features like encrypted chat, friend system, and smart communication tools.",
    extraLineOne: "Instantly connect with your trusted contacts in one tap.",
    extraLineTwo: "Built with privacy-first communication at every step.",
  },
  {
    title: "Build Stronger Connections",
    description:
      "Manage favourites, friend requests, and private conversations with an intuitive and clean workflow.",
    subTitle: "Smart Contact & Friend System",
    subDescription:
      "Keep your social graph organized with fast access to recent chats and live online presence.",
    extraLineOne: "Track unread updates and stay in sync in real time.",
    extraLineTwo: "Quick actions help you focus on meaningful conversations.",
  },
  {
    title: "Modern Experience, Zero Clutter",
    description:
      "Enjoy a responsive chat interface that adapts smoothly across desktop and mobile screens.",
    subTitle: "Optimized For Everyday Use",
    subDescription:
      "From smooth transitions to fast message delivery, Chatify keeps communication effortless.",
    extraLineOne: "Designed to reduce noise and improve chat productivity.",
    extraLineTwo: "A consistent UI flow keeps your conversations uninterrupted.",
  },
];

const validateLogin = ({ email, password }) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.trim()) errors.email = "Email is required";
  else if (!emailRegex.test(email)) errors.email = "Please enter a valid email";

  if (!password) errors.password = "Password is required";

  return errors;
};

const validateSignup = ({ fullName, email, password }) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!fullName.trim()) errors.fullName = "Username is required";
  if (!email.trim()) errors.email = "Email is required";
  else if (!emailRegex.test(email)) errors.email = "Please enter a valid email";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters";

  return errors;
};

function LoginPage({ initialMode = "signin" }) {
  const [isSignup, setIsSignup] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const { login, signup, isLoggingIn, isSigningUp } = useAuthStore();
  const activeFields = isSignup ? signupFields : loginFields;
  const isSubmitting = isSignup ? isSigningUp : isLoggingIn;
  const selectedSlide = infoSlides[activeSlide];

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = isSignup ? validateSignup(formData) : validateLogin(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    if (isSignup) {
      signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      return;
    }

    login({ email: formData.email.trim(), password: formData.password });
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSwitchMode = () => {
    setIsSignup((prev) => !prev);
    setErrors({});
  };

  useEffect(() => {
    setIsSignup(initialMode === "signup");
    setErrors({});
  }, [initialMode]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % infoSlides.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="auth-screen h-screen w-screen">
      <div className="auth-shell h-full w-full overflow-hidden">
        <div className="flex h-full w-full flex-col md:flex-row">
          <aside className="auth-info-panel hidden h-full md:flex md:w-3/5">
            <div className="relative z-10 mx-auto flex h-full w-full max-w-3xl flex-col justify-between px-10 py-16 xl:px-16">
              <div>
                <p className="text-sm tracking-[0.2em] uppercase text-cyan-200/80">Chatify</p>
                <h1 className="mt-4 text-4xl font-semibold leading-tight text-white xl:text-5xl">
                  {selectedSlide.title}
                </h1>
                <p className="mt-5 text-base leading-relaxed text-cyan-50/90">
                  {selectedSlide.description}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium text-cyan-100">{selectedSlide.subTitle}</h2>
                <p className="mt-3 max-w-md text-sm text-cyan-100/85">
                  {selectedSlide.subDescription}
                </p>
                <p className="mt-2 max-w-md text-sm text-cyan-100/90">{selectedSlide.extraLineOne}</p>
                <p className="mt-1 max-w-md text-sm text-cyan-100/90">{selectedSlide.extraLineTwo}</p>

                <button type="button" className="auth-ghost-btn mt-7">
                  Explore Chat
                </button>

                <div className="mt-8 flex items-center gap-2">
                  {infoSlides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      className={`auth-dot cursor-pointer ${activeSlide === index ? "auth-dot-active" : ""}`}
                      aria-label={`Show info slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="auth-form-side h-full w-full px-4 py-8 sm:px-8 sm:py-10 md:w-2/5 md:px-10 md:py-12 lg:px-12 lg:py-14">
            <div className="auth-form-card mx-auto w-full max-w-xl rounded-2xl p-7 shadow-2xl sm:p-8">
              <div className="mb-8 text-center">
                <MessageCircleIcon className="mx-auto mb-3 size-10 text-sky-600" />
                <h2 className="text-3xl font-semibold text-slate-900">
                  {isSignup ? "Create Your Chatify Account" : "Welcome to Chatify"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {isSignup
                    ? "Sign up to start secure conversations."
                    : "Sign in to continue your secure conversations."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form-transition space-y-5" key={isSignup ? "signup" : "signin"}>
                {activeFields.map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.key}>
                      <label className="auth-light-label">{field.label}</label>
                      <div className="relative">
                        <Icon className="auth-light-icon" />
                        <input
                          type={field.type}
                          value={formData[field.key]}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className={`auth-light-input ${errors[field.key] ? "auth-light-input-error" : ""}`}
                          placeholder={field.placeholder}
                        />
                      </div>
                      {errors[field.key] && <p className="auth-error-text mt-1">{errors[field.key]}</p>}
                    </div>
                  );
                })}

                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2 text-slate-600">
                    <input type="checkbox" className="size-4 rounded border-slate-300" />
                    <span>Keep me logged in</span>
                  </label>
                  {!isSignup && (
                    <button
                      type="button"
                      className="cursor-pointer text-sky-600 transition hover:text-emerald-600"
                    >
                      Forgot Password
                    </button>
                  )}
                </div>

                <button className="auth-gradient-btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <LoaderIcon className="mx-auto size-5 animate-spin" />
                  ) : isSignup ? (
                    "SIGN UP"
                  ) : (
                    "SIGN IN"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-600">
                {isSignup ? "Already have an account? " : "Don't have an account? "}
                <button
                  type="button"
                  onClick={handleSwitchMode}
                  className="signLink ml-1 bg-transparent font-medium"
                >
                  {isSignup ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
