// Shared style object for app/login/page.js and app/signup/page.js —
// same dark/gold palette and font stack as the rest of the site.
//
// backgroundColor is deliberately left off `button`, and border-related
// focus/hover feedback is deliberately left off `input` — both are
// applied via each page's own <style jsx> block instead, since an
// inline style always wins over a stylesheet rule regardless of
// selector (:hover, :focus, etc), which would make a stylesheet
// override of the same property permanently dead code.

const authFormStyles = {
  section: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#08040A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "130px 2rem 3rem",
    boxSizing: "border-box",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  form: {
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  title: {
    fontFamily: "var(--font-khmer), var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "2rem",
    fontWeight: 600,
    margin: "0 0 0.5rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#BBAEBF",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    border: "1px solid #2A172F",
    borderRadius: 10,
    padding: "0.75rem 1rem",
    color: "#F5EFE6",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.95rem",
    outline: "none",
  },
  button: {
    marginTop: "0.5rem",
    width: "100%",
    padding: "0.85rem",
    borderRadius: 999,
    border: "none",
    backgroundColor: "#C5A059",
    color: "#08040A",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.85rem",
    color: "#E58B8B",
    margin: 0,
  },
};

export default authFormStyles;
