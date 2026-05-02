export default function TrustedBySection() {
  const brands = ["Stripe", "Airbnb", "HubSpot", "Linear", "Discord"];

  return (
    <section
      style={{
        padding: "var(--space-12) 0",
        background: "var(--color-surface-container-low)",
      }}
    >
      <div className="container" style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-on-surface-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: "var(--space-6)",
          }}
        >
          Trusted by forward-thinking teams
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "var(--space-12)",
            flexWrap: "wrap",
            opacity: 0.5,
          }}
        >
          {brands.map((name) => (
            <span
              key={name}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xl)",
                fontWeight: "var(--weight-extrabold)",
                color: "var(--color-on-surface)",
                letterSpacing: "var(--tracking-tight)",
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
