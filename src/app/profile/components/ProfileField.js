const ProfileField = ({ label, value }) => (
    <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border rounded-md">
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="text-gray-600">{value}</span>
    </div>
  );
  
  export default ProfileField;
  



