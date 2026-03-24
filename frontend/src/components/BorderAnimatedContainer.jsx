// How to make animated gradient border 👇
// https://cruip-tutorials.vercel.app/animated-gradient-border/


function BorderAnimatedContainer({ children }) {
  return (
    <div className="w-full h-full [background:linear-gradient(45deg,rgba(15,32,39,.86),rgba(44,83,100,.78)_50%,rgba(15,32,39,.86))_padding-box,conic-gradient(from_var(--border-angle),rgba(255,255,255,.22)_80%,_#00c6ff_88%,_#00ffcc_92%,_#00c6ff_96%,_rgba(255,255,255,.22))_border-box] rounded-2xl border border-transparent animate-border flex overflow-hidden shadow-2xl">
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;
