import { motion } from "framer-motion";
import { features } from "../../../data/homeData";

export default function FeaturesSection() {
  return (
    <section
      style={{
        background: "var(--color-surface-container-low)",
        padding: "var(--space-32) 0",
      }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontSize: "var(--text-sm)",
              color: "var(--color-primary)",
              fontWeight: "var(--weight-semibold)",
              display: "inline-block",
              marginBottom: "var(--space-4)",
            }}
          >
            Powerful Features
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-5xl)",
              fontWeight: "var(--weight-extrabold)",
              letterSpacing: "var(--tracking-display)",
              color: "var(--color-on-surface)",
              marginBottom: "var(--space-4)",
            }}
          >
            Built for modern support teams
          </h2>
          <p
            style={{
              fontSize: "var(--text-lg)",
              color: "var(--color-on-surface-variant)",
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            Everything you need to automate your support workflow and keep
            customers happy 24/7.
          </p>
        </div>
        <div className="grid-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass card-hover"
              style={{
                padding: "var(--space-10)",
                borderRadius: "var(--radius-lg)",
                marginTop: i % 2 === 1 ? "var(--space-8)" : "0",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--color-primary-light)",
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-5)",
                }}
              >
                <f.icon size={22} style={{ color: "var(--color-primary)" }} />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-xl)",
                  fontWeight: "var(--weight-bold)",
                  color: "var(--color-on-surface)",
                  marginBottom: "var(--space-3)",
                  letterSpacing: "var(--tracking-display)",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-on-surface-variant)",
                  lineHeight: "var(--leading-body)",
                }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
