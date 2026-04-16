import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import ChatGuide from "./ChatGuide";
import { QuoteProvider } from "@/contexts/QuoteContext";
import { MobileMenuProvider, useMobileMenu } from "@/contexts/MobileMenuContext";

interface LayoutProps {
  children: ReactNode;
}

const LayoutContent = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { isMenuOpen } = useMobileMenu();

  // Hide ChatGuide on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Accessibility: Live region for announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="a11y-announcer"
      />
      <Header />
      <main id="main-content" className="flex-1 pt-16 md:pt-20" role="main">{children}</main>
      <Footer />
      {/* Hide floating buttons when mobile menu is open */}
      <div className={isMenuOpen ? 'lg:block hidden' : ''}>
        <ScrollToTop />
        {!isAdminPage && <ChatGuide />}
      </div>
    </div>
  );
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <QuoteProvider>
      <MobileMenuProvider>
        <LayoutContent>{children}</LayoutContent>
      </MobileMenuProvider>
    </QuoteProvider>
  );
};

export default Layout;
