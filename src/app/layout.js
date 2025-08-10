import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import { ThemeProvider } from "../components/ThemeProvider";
import SystemStatusBanner from "../components/SystemStatusBanner";
import { NotificationProvider } from "../contexts/NotificationContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Campus Sell",
  description: "A marketplace for campus communities",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider defaultTheme="light" storageKey="campus-sell-theme">
          <NotificationProvider>
            {/* Skip link for keyboard navigation */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Header />
            {/* <SystemStatusBanner /> */}
            <main id="main-content" className="min-h-screen bg-background text-foreground">
              {children}
            </main>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
