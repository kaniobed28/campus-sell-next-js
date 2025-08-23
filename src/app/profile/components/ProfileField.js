const ProfileField = ({ label, value }) => (
    <div className="flex justify-between items-center px-4 py-3 bg-muted border border-border rounded-md">
      <span className="font-medium text-foreground">{label}:</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
  
  export default ProfileField;
  



