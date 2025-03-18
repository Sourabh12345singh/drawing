import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001"); // Change this for production



const UserManagement = () => {

  const [sessionId, setSessionId] = useState("");
 ;

  useEffect(() => {
    socket.on("sessionId", (id: string) => {
      setSessionId(id);
    });

 
    return () => {
      socket.off("sessionId");
    };
  }, [sessionId]);

 

  const handleInvite = () => {
    const inviteLink = `${window.location.origin}?session=${sessionId}`;
    navigator.clipboard.writeText(inviteLink);
    
    toast.success("Session link copied!");
  };

  return (
    <button
            onClick={handleInvite}
            className="bg-green-500 text-white p-2 rounded w-full mt-2"
          >
            Invite Link
          </button>
  );
};

export default UserManagement;
