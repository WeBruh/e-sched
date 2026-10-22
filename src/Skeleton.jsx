export default function Skeleton() {
  return (
    <section className="sk">
      <div className="sk-bar sh" />
      <div className="sk-row">
        {[0, 1, 2].map((i) => <div key={i} className="sk-col"><div className="sk-dot sh" /><div className="sk-line sh" /></div>)}
      </div>
      <div className="sk-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="sk-card"><div className="sk-img sh" /><div className="sk-line sh" /><div className="sk-line short sh" /></div>
        ))}
      </div>
    </section>
  );
}