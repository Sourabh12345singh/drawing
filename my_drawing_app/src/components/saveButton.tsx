//this is invite link 

import toast from "react-hot-toast";

export const inviteLink = () => {
  navigator.clipboard.writeText(window.location.href)
    .then(() => toast.success("link copied"))
    .catch(() => toast.error("Failed to copy URL."));
};