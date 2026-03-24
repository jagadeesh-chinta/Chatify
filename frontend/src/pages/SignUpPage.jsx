import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router";
import toast from "react-hot-toast";

const signupFields = [
  {
    key: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "John Doe",
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
    placeholder: "Create a password",
    icon: LockIcon,
  },
];

const validateSignup = ({ fullName, email, password }) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!fullName.trim()) errors.fullName = "Full name is required";

  if (!email.trim()) errors.email = "Email is required";
  else if (!emailRegex.test(email)) errors.email = "Please enter a valid email";

  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters";

  return errors;
};

function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateSignup(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    signup(formData);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="auth-screen w-full min-h-screen p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl shadow-2xl bg-white/10 border border-white/20">
        <div className="flex min-h-[680px] flex-col lg:flex-row">
          <aside className="auth-info-panel hidden lg:flex lg:w-1/2">
            <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-14">
              <div>
                <p className="text-sm tracking-[0.2em] uppercase text-cyan-200/80">Chatify</p>
                <h1 className="mt-4 text-4xl font-semibold leading-tight text-white xl:text-5xl">
                  Real-Time Secure Messaging
                </h1>
                <p className="mt-5 text-base leading-relaxed text-cyan-50/90">
                  Chat, connect, and communicate with end-to-end secure features and modern UI
                  experience.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-medium text-cyan-100">
                  Secure Real-Time Chat Application
                </h2>
                <p className="mt-3 max-w-md text-sm text-cyan-100/85">
                  Experience secure messaging with advanced features like encrypted chat, friend
                  system, and smart communication tools.
                </p>

                <button type="button" className="auth-ghost-btn mt-7">
                  Explore Chat
                </button>

                <div className="mt-8 flex items-center gap-2">
                  <span className="auth-dot" />
                  <span className="auth-dot auth-dot-active" />
                  <span className="auth-dot" />
                </div>
              </div>
            </div>
          </aside>

          <section className="w-full bg-slate-50 px-6 py-10 sm:px-10 lg:w-1/2 lg:px-12 lg:py-16">
            <div className="mx-auto w-full max-w-md rounded-xl bg-white p-7 shadow-xl sm:p-8">
              <div className="mb-8 text-center">
                <MessageCircleIcon className="mx-auto mb-3 size-10 text-sky-600" />
                <h2 className="text-3xl font-semibold text-slate-900">Create Your Chatify Account</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Start secure conversations in seconds.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {signupFields.map((field) => {
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

                <button className="auth-gradient-btn" type="submit" disabled={isSigningUp}>
                  {isSigningUp ? (
                    <LoaderIcon className="mx-auto size-5 animate-spin" />
                  ) : (
                    "CREATE ACCOUNT"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-sky-600 transition hover:text-emerald-600">
                  Sign In
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
export default SignUpPage;
