export const InfoIcon = ({ text }: { text: string }) => (
    <span 
      className="info-icon" 
      style={{ marginLeft: "auto" }} 
    >
      i
      <span className="tooltip-text">{text}</span>
    </span>
  );