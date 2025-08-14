const ProfileAvatar = ({ src }) => (
    <div className="flex items-center justify-center mb-6">
      <img
        src={src || "https://via.placeholder.com/150"}
        alt="User Avatar"
        className="w-32 h-32 rounded-full border-4 border-blue-500"
      />
    </div>
  );
  
  export default ProfileAvatar;
  


