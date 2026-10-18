// A gold icon inside the left end of a text field (login page: mail on
// Email, padlock on Password). Recoloured via mask-image like every other
// icon in this app — background-color shows through the PNG's opaque parts.
// The parent must be position: relative, and the input needs extra
// left padding so typed text never runs under the icon. Decorative only:
// aria-hidden, and pointer-events: none so clicks reach the input.

const styles = {
  icon: {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    width: 18,
    height: 18,
    backgroundColor: "#C5A059",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    pointerEvents: "none",
  },
};

export default function InputIcon({ src }) {
  return (
    <span
      style={{ ...styles.icon, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
      aria-hidden="true"
    />
  );
}
