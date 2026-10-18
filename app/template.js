// Wraps every page. Unlike layout.js, Next.js re-creates a template on each
// navigation, so the fade-in below replays for every page change — one
// consistent, gentle transition everywhere, including login/signup, which
// used to appear abruptly.
// Opacity only, no movement: a transform here would turn this wrapper into
// the reference box for position: fixed children (the NavBar, modals),
// shifting them mid-animation.
export default function Template({ children }) {
  return <div className="page-transition">{children}</div>;
}
