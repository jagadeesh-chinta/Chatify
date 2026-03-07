import { useNavigate } from "react-router";
import { ArrowLeft, Download, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function ViewProfileImage() {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  const profileImage = authUser?.profilePic || "/avatar.png";
  const hasCustomImage = !!authUser?.profilePic;

  // Handle download
  const handleDownload = async () => {
    if (!authUser?.profilePic) return;

    try {
      const response = await fetch(authUser.profilePic);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `profile_${authUser.fullName?.replace(/\s+/g, "_") || "image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  // Handle close
  const handleClose = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-slate-900/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Profile</span>
        </button>

        <div className="flex items-center gap-2">
          {hasCustomImage && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative max-w-3xl max-h-[80vh] w-full h-full flex items-center justify-center">
          <img
            src={profileImage}
            alt="Profile Preview"
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 text-center">
        <p className="text-slate-400 text-sm">
          {authUser?.fullName}'s Profile Picture
        </p>
      </div>
    </div>
  );
}

export default ViewProfileImage;
