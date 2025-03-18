import DrawingBoard from "./DrawingBoard";
import UserManagement from "./UserManagement";

const DrawingPage = () => {
  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold mb-4">Collaborative Drawing Board</h2>
      <UserManagement />
      <DrawingBoard />
    </div>
  );
};

export default DrawingPage;
