import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

function FriendRequestBlock({ otherUser, status }) {
  const [loading, setLoading] = useState(false);
  const { fetchFriendStatus } = useChatStore();

  if (!status) {
    return null;
  }

  // Case 1: Already friends - should not render (ChatContainer should show MessageInput instead)
  if (status.status === "friends") {
    return null;
  }

  // Case 2: Friends already - show nothing
  if (status.status === "friends") {
    return null;
  }

  // Case 3: Request sent by me - show "Friend Request Sent"
  if (status.status === "sent") {
    return (
      <div className="p-4 md:p-6 text-center">
        <p className="text-slate-200 mb-3">Friend request sent to {otherUser?.fullName}</p>
      </div>
    );
  }

  // Case 4: Request received by me - show "Accept/Reject"
  if (status.status === "received") {
    const handleAccept = async () => {
      setLoading(true);
      try {
        await axiosInstance.post(`/friend-request/accept`, { requestId: status.requestId });
        toast.success("Friend request accepted!");
        // Refresh friend status to update UI
        await fetchFriendStatus(otherUser._id);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to accept request");
      } finally {
        setLoading(false);
      }
    };

    const handleReject = async () => {
      setLoading(true);
      try {
        await axiosInstance.post(`/friend-request/reject`, { requestId: status.requestId });
        toast.success("Friend request rejected");
        // Refresh friend status to update UI
        await fetchFriendStatus(otherUser._id);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to reject request");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="p-4 md:p-6 text-center">
        <p className="text-slate-200 mb-4">{status.senderName} wants to be your friend</p>
        <div className="flex gap-3 justify-center">
          <button
            disabled={loading}
            onClick={handleAccept}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50 min-h-[44px]"
          >
            Accept
          </button>
          <button
            disabled={loading}
            onClick={handleReject}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 min-h-[44px]"
          >
            Reject
          </button>
        </div>
      </div>
    );
  }

  // Case 5: No relationship - show "Send Friend Request"
  if (status.status === "not_friends") {
    const handleSendRequest = async () => {
      setLoading(true);
      try {
        await axiosInstance.post(`/friend-request`, { receiverId: otherUser._id });
        toast.success("Friend request sent!");
        // Refresh friend status to update UI
        await fetchFriendStatus(otherUser._id);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send request");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="p-4 md:p-6 text-center">
        <p className="text-slate-200 mb-3">You must send a friend request to start chatting</p>
        <button
          disabled={loading}
          onClick={handleSendRequest}
          className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 min-h-[44px]"
        >
          Send Friend Request
        </button>
      </div>
    );
  }

  return null;
}

export default FriendRequestBlock;
