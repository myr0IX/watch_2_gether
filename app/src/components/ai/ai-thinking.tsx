export const AIThinking = () => (
  <div
    className="flex items-center gap-2 text-smw"
    style={{ color: "var(--fallout-brown)" }}
  >
    <div className="flex gap-1">
      <div
        className="w-2 h-2 rounded-full animate-bounce"
        style={{
          backgroundColor: "var(--fallout-green)",
          animationDelay: "0s",
        }}
      />
      <div
        className="w-2 h-2 rounded-full animate-bounce"
        style={{
          backgroundColor: "var(--fallout-green)",
          animationDelay: "0.2s",
        }}
      />
      <div
        className="w-2 h-2 rounded-full animate-bounce"
        style={{
          backgroundColor: "var(--fallout-green)",
          animationDelay: "0.4s",
        }}
      />
    </div>
    <span>L&apos;IA écrit...</span>
  </div>
);
