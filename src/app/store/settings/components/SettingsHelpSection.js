const SettingsHelpSection = () => {
  const tips = [
    {
      category: "Store Policies",
      description: "Clear policies help buyers understand your terms and reduce disputes"
    },
    {
      category: "Auto-Responses", 
      description: "Automated replies help you respond quickly and maintain good communication"
    },
    {
      category: "Notifications",
      description: "Stay informed about important store activities without being overwhelmed"
    },
    {
      category: "Best Practice",
      description: "Review and update your settings regularly to optimize your selling experience"
    }
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">
        <span className="mr-2" aria-hidden="true">💡</span>
        Settings Tips
      </h3>
      <div className="space-y-2 text-blue-800 text-sm">
        {tips.map((tip, index) => (
          <p key={index}>
            • <strong>{tip.category}:</strong> {tip.description}
          </p>
        ))}
      </div>
    </div>
  );
};

export default SettingsHelpSection;