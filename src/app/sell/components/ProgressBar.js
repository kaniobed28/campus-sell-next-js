const ProgressBar = ({ progress }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-foreground">Upload Progress</span>
      <span className="text-sm text-muted-foreground">{progress}%</span>
    </div>
    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
      <div
        className="bg-accent h-2 rounded-full theme-transition"
        style={{ 
          width: `${progress}%`,
          transition: 'width 0.3s ease-in-out'
        }}
      />
    </div>
    {progress > 0 && progress < 100 && (
      <p className="text-xs text-muted-foreground mt-1">
        Uploading images...
      </p>
    )}
    {progress === 100 && (
      <p className="text-xs text-success mt-1">
        ✓ Upload complete!
      </p>
    )}
  </div>
);

export default ProgressBar;

