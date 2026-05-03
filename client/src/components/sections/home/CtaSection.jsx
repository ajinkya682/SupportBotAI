import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section style={{ padding: "0 var(--space-8) var(--space-16)" }}>
      <div
        style={{
          background: "var(--color-primary-gradient)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-20)",
          textAlign: "center",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-5xl)",
            fontWeight: "var(--weight-extrabold)",
            letterSpacing: "var(--tracking-display)",
            color: "white",
            marginBottom: "var(--space-5)",
          }}
        >
          Start automating your support today
        </h2>
        <p
          style={{
            fontSize: "var(--text-lg)",
            color: "rgba(255,255,255,0.85)",
            marginBottom: "var(--space-8)",
            lineHeight: "var(--leading-body)",
          }}
        >
          Join thousands of businesses that trust SupportBotAI.
        </p>
        <Link to="/signup" className="btn btn-white btn-lg">
          Get Started for Free <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
