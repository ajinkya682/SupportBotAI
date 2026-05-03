import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

// Simple placeholder pages so your links don't break!
// You can replace these with real files in your /pages folder later.
const Signup = () => (
  <div style={{ padding: "100px", textAlign: "center" }}>
    <h2>Signup Page Coming Soon</h2>
  </div>
);
const Product = () => (
  <div style={{ padding: "100px", textAlign: "center" }}>
    <h2>Product Page Coming Soon</h2>
  </div>
);
const Pricing = () => (
  <div style={{ padding: "100px", textAlign: "center" }}>
    <h2>Pricing Page Coming Soon</h2>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      {/* Routes acts like a switch, showing only the page that matches the URL */}
      <Routes>
        {/* Your main landing page */}
        <Route path="/" element={<Home />} />

        {/* Other pages */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/product" element={<Product />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </BrowserRouter>
  );
}
