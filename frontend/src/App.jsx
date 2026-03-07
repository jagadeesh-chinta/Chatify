import { Routes , Route, Navigate} from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import RestoreChat from "./pages/RestoreChat";
import ChatKeyPage from "./pages/ChatKeyPage";
import ProfilePage from "./pages/ProfilePage";
import CropProfileImage from "./pages/CropProfileImage";
import ViewProfileImage from "./pages/ViewProfileImage";
import RequestsPage from "./components/RequestsPage";
import { useAuthStore } from "./store/useAuthStore";
import { use, useEffect } from "react";
import PageLoader from "./components/PageLoader";
import {Toaster} from "react-hot-toast";

function App()
{
  const {checkAuth, isCheckingAuth, authUser} = useAuthStore();
  useEffect(() => {
    checkAuth();
  },[checkAuth]);

  if(isCheckingAuth) return <PageLoader />;

  return(
  <div className = "min-h-screen bg-slate-900 relative flex items-center justify-center p-0 md:p-4 overflow-hidden">
    {/* DECORATORS - GRID BG & GLOW SHAPES */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
    <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
    <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />
  

    <Routes>
      <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/login"}/>} />
      <Route path="/restore-chat" element={authUser ? <RestoreChat /> : <Navigate to={"/login"}/>} />
      <Route path="/chatkey" element={authUser ? <ChatKeyPage /> : <Navigate to={"/login"}/>} />
      <Route path="/requests" element={authUser ? <RequestsPage /> : <Navigate to={"/login"}/>} />
      <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to={"/login"}/>} />
      <Route path="/profile/crop" element={authUser ? <CropProfileImage /> : <Navigate to={"/login"}/>} />
      <Route path="/profile/view-image" element={authUser ? <ViewProfileImage /> : <Navigate to={"/login"}/>} />
      <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
      <Route path="/signup" element={!authUser ?<SignUpPage />:<Navigate to={"/"} />} />
    </Routes>

    <Toaster />
  </div>
  );
}
export default App;