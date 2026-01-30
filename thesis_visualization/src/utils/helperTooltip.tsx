// Helper Component for Tooltips
export const InfoIcon = ({ text }: { text: string }) => (
    <span 
      className="info-icon" 
      // This pushes the icon to the far right edge
      style={{ marginLeft: "auto" }} 
    >
      i
      <span className="tooltip-text">{text}</span>
    </span>
  );