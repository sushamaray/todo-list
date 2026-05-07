import { Space_Grotesk, Lexend, Andika } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space"
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend"
});

const andika = Andika({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-andika"
});

export const metadata = {
  title: "To-Do List",
  description: "A calmer task board with clearer priorities and thoughtful motion.",
  manifest: "/manifest.webmanifest",
  applicationName: "To-Do List",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "To-Do List"
  },
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "512x512" },
      { url: "/icons/pwa-192", type: "image/png", sizes: "192x192" }
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon"]
  }
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${lexend.variable} ${andika.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
