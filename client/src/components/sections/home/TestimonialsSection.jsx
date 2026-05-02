import { motion } from "framer-motion";
import { testimonials } from "../../../data/homeData";

export default function TestimonialsSection() {
  return (
    <section
      style={{
        background: "var(--color-surface-container-low)",
        padding: "var(--space-24) 0",
      }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-5xl)",
              fontWeight: "var(--weight-extrabold)",
              letterSpacing: "var(--tracking-display)",
              color: "var(--color-on-surface)",
            }}
          >
            Loved by support teams
          </h2>
        </div>
        <div className="grid-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card card-hover"
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-lg)",
                  color: "var(--color-on-surface)",
                  lineHeight: "var(--leading-body)",
                  marginBottom: "var(--space-6)",
                }}
              >
                "{t.quote}"
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                }}
              >
                <div className="avatar avatar-md">{t.initials}</div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: "var(--weight-semibold)",
                      fontSize: "var(--text-sm)",
                      color: "var(--color-on-surface)",
                    }}
                  >
                    {t.author}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-on-surface-muted)",
                    }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
