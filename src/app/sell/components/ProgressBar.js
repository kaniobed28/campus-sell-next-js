const ProgressBar = ({ progress }) => (
    <div className="mb-4">
      <p className="text-sm text-gray-600">Upload Progress: {progress}%</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
  
  export default ProgressBar;
  