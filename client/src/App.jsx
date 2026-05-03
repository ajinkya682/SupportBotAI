import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";

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
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/signup" element={<div>Signup</div>} />
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/product" element={<div>Product</div>} />
        <Route path="/pricing" element={<div>Pricing</div>} />
      </Routes>
    </BrowserRouter>
  );
}
