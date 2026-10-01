import { useState, useRef, useEffect } from "react";
import { ArrowLeft, User, MessageSquare, Image as ImageIcon, Bell, CheckSquare, Upload, UserMinus, Ban, Check, Heart, X, ZoomIn, ZoomOut, Save } from "lucide-react";
import Cropper from "react-easy-crop";
import { useChatStore } from "../store/useChatStore";
import RemoveFriendConfirmation from "./RemoveFriendConfirmation";
import toast from "react-hot-toast";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg", 0.9);
};

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}

function ChatSettings({ userId, initialProfile, onBack }) {
  const [activeTab, setActiveTab] = useState("user");
  const { chatPreference, updateChatPreference, uploadChatBackgroundImage, isPreferenceLoading, getOtherUserProfile, removeFriend, friendStatus, toggleFavourite, isFavourite } = useChatStore();
  const [profile, setProfile] = useState(initialProfile || null);
  const [isLoading, setIsLoading] = useState(!initialProfile);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const [localNickname, setLocalNickname] = useState("");
  const [isFav, setIsFav] = useState(false);

  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (chatPreference) {
      setLocalNickname(chatPreference.nickname || "");
    }
  }, [chatPreference]);

  useEffect(() => {
    const checkFavourite = async () => {
      const fav = await isFavourite(userId);
      setIsFav(fav);
    };
    checkFavourite();
  }, [userId, isFavourite]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profile) setIsLoading(true);
      const data = await getOtherUserProfile(userId);
      setProfile(data);
      setIsLoading(false);
    };
    fetchProfile();
  }, [userId, getOtherUserProfile]);

  const handleToggleFavourite = async () => {
    const newFavStatus = await toggleFavourite(userId);
    setIsFav(newFavStatus);
  };

  const handleUpdatePreference = async (updates) => {
    await updateChatPreference(userId, updates);
  };

  const handleNicknameSubmit = (e) => {
    e.preventDefault();
    handleUpdatePreference({ nickname: localNickname });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropImageSrc(reader.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropSave = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;

    try {
      const croppedImageBase64 = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      if (!croppedImageBase64) throw new Error("Failed to crop image");
      
      const file = dataURLtoFile(croppedImageBase64, "background.jpg");
      await uploadChatBackgroundImage(userId, file);
      setCropImageSrc(null);
    } catch (error) {
      toast.error(error.message || "Failed to process image");
    }
  };

  const pageTheme = localStorage.getItem("chatTheme") || "dark";
  const displayImage = profile?.profilePic || "/avatar.png";

  return (
    <div className={`feature-page chat-theme-${pageTheme} flex flex-col h-full bg-slate-900 absolute inset-0 z-10`}>
      {/* Header */}
      <div className="feature-card !rounded-none border-b border-white/10 flex items-center gap-3 px-4 md:px-6 py-4 flex-shrink-0">
        <button
          onClick={onBack}
          className="feature-back-btn flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="font-bold text-lg ml-2">Chat Settings</div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Nav */}
        <div className="w-64 border-r border-white/10 p-4 flex flex-col gap-2 overflow-y-auto hidden md:flex">
          <button
            onClick={() => setActiveTab("user")}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === "user" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:bg-slate-800"}`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">User</span>
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === "messages" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:bg-slate-800"}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Messages</span>
          </button>
          <button
            onClick={() => setActiveTab("background")}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === "background" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:bg-slate-800"}`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="font-medium">Background</span>
          </button>
        </div>

        {/* Mobile Tab Select */}
        <div className="md:hidden flex overflow-x-auto p-4 border-b border-white/10 flex-shrink-0 absolute top-[76px] left-0 right-0 bg-slate-900 z-20">
           <button
            onClick={() => setActiveTab("user")}
            className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap rounded-full transition-colors ${activeTab === "user" ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            <User className="w-4 h-4" /> User
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`ml-2 flex items-center gap-2 px-4 py-2 whitespace-nowrap rounded-full transition-colors ${activeTab === "messages" ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            <MessageSquare className="w-4 h-4" /> Messages
          </button>
          <button
            onClick={() => setActiveTab("background")}
            className={`ml-2 flex items-center gap-2 px-4 py-2 whitespace-nowrap rounded-full transition-colors ${activeTab === "background" ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            <ImageIcon className="w-4 h-4" /> Background
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto mt-[60px] md:mt-0 relative">
          
          {activeTab === "user" && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-6">
                <img src={displayImage} alt="User" className="w-24 h-24 rounded-full object-cover border-2 border-slate-700" />
                <div>
                  <h2 className="text-2xl font-bold">{profile?.fullName || "Loading..."}</h2>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-cyan-400 border-b border-white/10 pb-2">Customization</h3>
                <form onSubmit={handleNicknameSubmit} className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 block mb-1">Set Nickname (Only visible to you)</label>
                    <input
                      type="text"
                      value={localNickname}
                      onChange={(e) => setLocalNickname(e.target.value)}
                      placeholder="Enter nickname..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <button type="submit" className="mt-5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-2">
                    <Check className="w-4 h-4" /> Save
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-pink-400 border-b border-white/10 pb-2">Actions</h3>
                
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Heart className={`w-5 h-5 ${isFav ? 'text-pink-500 fill-pink-500' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-medium">Favourite</div>
                      <div className="text-xs text-slate-400">Add to your favourite contacts</div>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleFavourite}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${isFav ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                  >
                    {isFav ? 'Favourited' : 'Add'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <UserMinus className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="font-medium text-red-400">Remove Friend</div>
                      <div className="text-xs text-slate-400">Delete friend and chat history</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowRemoveConfirm(true)}
                    className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Ban className="w-5 h-5 text-orange-400" />
                    <div>
                      <div className="font-medium text-orange-400">Block User</div>
                      <div className="text-xs text-slate-400">Prevent them from messaging you</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      import("react-hot-toast").then((module) => {
                        module.default("Block feature is currently under development");
                      });
                    }}
                    className="px-4 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-full text-sm font-medium transition-colors"
                  >
                    Block
                  </button>
                </div>

              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold mb-6">Message Settings</h2>
              
              <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Notifications</h3>
                    <p className="text-sm text-slate-400">Receive alerts for new messages in this chat</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={chatPreference?.notificationsEnabled ?? true}
                    onChange={(e) => handleUpdatePreference({ notificationsEnabled: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="bg-purple-500/20 p-3 rounded-full text-purple-400">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Seen Status (Read Receipts)</h3>
                    <p className="text-sm text-slate-400">Let the other user know when you've read their messages (blue double tick)</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={chatPreference?.readReceiptsEnabled ?? true}
                    onChange={(e) => handleUpdatePreference({ readReceiptsEnabled: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

            </div>
          )}

          {activeTab === "background" && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold mb-2">Chat Appearance</h2>
              
              <div>
                <h3 className="text-lg font-medium text-cyan-400 border-b border-white/10 pb-2 mb-4">Background Image</h3>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/2 aspect-[9/16] bg-slate-800 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden relative group">
                    {chatPreference?.backgroundImage ? (
                      <img src={chatPreference.backgroundImage} alt="Chat Background" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-500 flex flex-col items-center">
                        <ImageIcon className="w-10 h-10 mb-2" />
                        <span>No custom background</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                      >
                        <Upload className="w-4 h-4" /> Change
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/2 space-y-4">
                    <p className="text-sm text-slate-400">
                      Upload a custom background image for this specific chat. It will remain fixed while messages scroll over it.
                    </p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div className="flex gap-3">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPreferenceLoading}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        {isPreferenceLoading ? 'Uploading...' : 'Upload Image'}
                      </button>
                      {chatPreference?.backgroundImage && (
                        <button 
                          onClick={() => handleUpdatePreference({ backgroundImage: '' })}
                          className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                          title="Remove Background"
                        >
                          <X className="w-4 h-4" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-cyan-400 border-b border-white/10 pb-2 mb-4">Message Text Color</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'Default', value: '' },
                    { name: 'Cyan', value: 'text-cyan-400' },
                    { name: 'Pink', value: 'text-pink-400' },
                    { name: 'Green', value: 'text-green-400' },
                    { name: 'Yellow', value: 'text-yellow-400' },
                    { name: 'Purple', value: 'text-purple-400' },
                    { name: 'White', value: 'text-white' },
                  ].map(color => (
                    <button
                      key={color.name}
                      onClick={() => handleUpdatePreference({ textColor: color.value })}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        (chatPreference?.textColor || '') === color.value 
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' 
                          : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {showRemoveConfirm && (
        <RemoveFriendConfirmation
          userName={profile?.fullName || 'User'}
          onConfirm={async () => {
            const success = await removeFriend(userId);
            if (success) {
              onBack();
            }
          }}
          onCancel={() => setShowRemoveConfirm(false)}
        />
      )}

      {cropImageSrc && (
        <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 md:p-6 animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800">
              <h3 className="font-semibold text-lg text-slate-100">Adjust Background Image</h3>
              <button onClick={() => setCropImageSrc(null)} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative w-full h-[50vh] sm:h-[60vh] bg-black">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={9/16}
                onCropChange={setCrop}
                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                onZoomChange={setZoom}
                showGrid={false}
              />
            </div>

            <div className="p-4 sm:p-6 bg-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-white/10">
              <div className="flex items-center gap-4 w-full sm:w-1/2">
                <ZoomOut className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <ZoomIn className="w-5 h-5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setCropImageSrc(null)}
                  disabled={isPreferenceLoading}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropSave}
                  disabled={isPreferenceLoading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors font-medium"
                >
                  {isPreferenceLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isPreferenceLoading ? "Saving..." : "Set Background"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatSettings;
