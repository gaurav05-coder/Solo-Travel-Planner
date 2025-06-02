import Navbar from "./Navbar";
import Footer from "./Footer";
import TravelAssistant from "./TravelAssistant";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <TravelAssistant />
      <Footer />
    </div>
  );
}
