import { Server } from "socket.io";
import type { Socket } from "socket.io";


interface User {
  username: string;
  socketId: string;
  isAdmin: boolean;
}

const users: User[] = [];

// ✅ Handle new user joining
export const handleUserJoin = (io: Server, socket: Socket, username: string) => {
  const isAdmin = users.length === 0; // First user is admin
  users.push({ username, socketId: socket.id, isAdmin });

  // Send updated user list to all
  io.emit("updateUsers", users);
};

// ✅ Handle user removal by admin
export const handleUserRemove = (io: Server, socket: Socket, username: string) => {
  const adminUser = users.find((user) => user.socketId === socket.id && user.isAdmin);

  if (!adminUser) {
    socket.emit("errorMessage", "Only the admin can remove users.");
    return;
  }

  const userIndex = users.findIndex((user) => user.username === username);
  if (userIndex !== -1) {
    const removedUser = users[userIndex];

    // Notify removed user
    io.to(removedUser.socketId).emit("removed");

    // Remove user from list
    users.splice(userIndex, 1);

    // Send updated user list to all
    io.emit("updateUsers", users);
  }
};

// ✅ Handle user disconnect
export const handleUserDisconnect = (io: Server, socket: Socket) => {
  const userIndex = users.findIndex((user) => user.socketId === socket.id);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    io.emit("updateUsers", users);
  }
};
