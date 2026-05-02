import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bot,
  Layers,
  BarChart3,
  Globe,
  Clock,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Check,
} from "lucide-react";

// --- DATA ---
const features = [
  {
    icon: Bot,
    title: "AI-First Resolution",
    desc: "Advanced LLMs understand intent and emotion, resolving most queries before a human sees them.",
  },
  {
    icon: Layers,
    title: "Seamless Routing",
    desc: "When AI detects complexity or emotion, it instantly routes to an agent with full context.",
  },
  {
    icon: Globe,
    title: "Instant Integration",
    desc: "Deploy your chatbot to any website with a single script tag. Zero code for basic setup.",
  },
  {
    icon: Shield,
    title: "Custom Knowledge",
    desc: "Train your AI on your docs, FAQs, and website content to ensure brand alignment.",
  },
  {
    icon: BarChart3,
    title: "Actionable Analytics",
    desc: "Track resolution rates, response times, and sentiment with a professional dashboard.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    desc: "Your support never sleeps. Instant answers for global customers regardless of time zones.",
  },
];

const stats = [
  { value: "80%", label: "Queries auto-resolved" },
  { value: "<2s", label: "Average response time" },
  { value: "99.9%", label: "Platform uptime" },
  { value: "4.9★", label: "Customer satisfaction" },
];

const tiers = [
  {
    name: "Starter",
    price: "$0",
    features: ["Up to 100 tickets/mo", "Basic AI Chatbot", "Email Support"],
    button: "Get Started",
    accent: false,
  },
  {
    name: "Pro",
    price: "$79",
    features: [
      "Unlimited tickets",
      "Advanced LLM (GPT-4)",
      "Priority Routing",
      "Custom Knowledge Base",
    ],
    button: "Start Free Trial",
    accent: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Dedicated Instance",
      "White-labeling",
      "SLA Guarantee",
      "24/7 Account Manager",
    ],
    button: "Contact Sales",
    accent: false,
  },
];

// --- MAIN COMPONENT ---
export default function Home() {
  return (
    <div style={{ background: "var(--color-surface)" }}>
      {/* HERO SECTION */}
      <section
        className="neural-bg"
        style={{
          minHeight: "100vh",
          background: "var(--color-surface-container-lowest)",
          display: "flex",
          alignItems: "center",
          paddingTop: "72px",
        }}
      >
        <div
          className="container"
          style={{
            width: "100%",
            paddingTop: "var(--space-16)",
            paddingBottom: "var(--space-20)",
          }}
        >
          <div className="grid-asymmetric">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-6)",
              }}
            >
              <span
                className="badge badge-success"
                style={{ gap: "var(--space-2)" }}
              >
                <Sparkles size={14} /> The Future of Customer Support
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-7xl)",
                  fontWeight: "var(--weight-extrabold)",
                  letterSpacing: "var(--tracking-tight)",
                  lineHeight: "var(--leading-display)",
                  color: "var(--color-on-surface)",
                }}
              >
                AI that resolves
                <br />
                <span style={{ color: "var(--color-primary)" }}>
                  tickets instantly.
                </span>
              </h1>
              <p
                style={{
                  fontSize: "var(--text-xl)",
                  color: "var(--color-on-surface-variant)",
                  lineHeight: "var(--leading-body)",
                  maxWidth: "480px",
                }}
              >
                SupportBotAI handles 80% of your common queries automatically,
                while seamlessly routing complex issues to your human team.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-4)",
                  flexWrap: "wrap",
                }}
              >
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Get Started for Free <ArrowRight size={18} />
                </Link>
                <Link to="/product" className="btn btn-ghost btn-lg">
                  See How It Works
                </Link>
              </div>
            </motion.div>

            {/* MOCK UI CARD */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
            >
              <div className="card-float">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "var(--space-6)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: "var(--weight-bold)",
                      fontSize: "var(--text-lg)",
                    }}
                  >
                    Live Dashboard
                  </div>
                  <span className="badge badge-success badge-dot">Live</span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "var(--space-4)",
                  }}
                >
                  <div
                    style={{
                      background: "var(--color-surface-container-low)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-4)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "var(--text-2xl)",
                        fontWeight: "var(--weight-extrabold)",
                        color: "var(--color-primary)",
                      }}
                    >
                      284
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-on-surface-muted)",
                      }}
                    >
                      Resolved Today
                    </div>
                  </div>
                  <div
                    style={{
                      background: "var(--color-surface-container-low)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-4)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "var(--text-2xl)",
                        fontWeight: "var(--weight-extrabold)",
                        color: "var(--color-primary)",
                      }}
                    >
                      1.8s
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-on-surface-muted)",
                      }}
                    >
                      Avg Response
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        style={{
          background: "var(--color-surface-container-low)",
          padding: "var(--space-32) 0",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-5xl)",
                fontWeight: "var(--weight-extrabold)",
              }}
            >
              Built for modern teams
            </h2>
          </div>
          <div className="grid-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="glass"
                style={{
                  padding: "var(--space-10)",
                  borderRadius: "var(--radius-lg)",
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
                    fontWeight: "var(--weight-bold)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION (Integrated) */}
      <section
        style={{
          padding: "var(--space-24) 0",
          background: "var(--color-surface-container-lowest)",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-5xl)",
                fontWeight: "var(--weight-extrabold)",
              }}
            >
              Simple Pricing
            </h2>
          </div>
          <div className="grid-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={tier.accent ? "card-float" : "card"}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <h3
                  style={{
                    fontSize: "var(--text-xl)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  {tier.name}
                </h3>
                <div
                  style={{
                    fontSize: "var(--text-4xl)",
                    fontWeight: "var(--weight-extrabold)",
                    marginBottom: "var(--space-6)",
                  }}
                >
                  {tier.price}
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    marginBottom: "var(--space-8)",
                    flex: 1,
                  }}
                >
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        marginBottom: "var(--space-3)",
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      <Check
                        size={16}
                        style={{ color: "var(--color-secondary)" }}
                      />{" "}
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn ${tier.accent ? "btn-primary" : "btn-secondary"}`}
                >
                  {tier.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "var(--color-surface-container-low)",
          padding: "var(--space-16) 0 var(--space-8)",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid var(--color-surface-container-high)",
              paddingTop: "var(--space-8)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: "var(--weight-extrabold)",
                color: "var(--color-primary)",
              }}
            >
              SUPPORTBOT AI
            </div>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-on-surface-muted)",
              }}
            >
              © 2026 SupportBotAI Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
