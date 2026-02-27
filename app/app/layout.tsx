import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrafficPulse - Traffic Prediction Game on Stellar",
  description: "Predict traffic volume and win PULSE tokens on the Stellar blockchain",
  keywords: ["Stellar", "Soroban", "blockchain", "prediction", "traffic", "web3", "DeFi"],
  authors: [{ name: "TrafficPulse Team" }],
  openGraph: {
    title: "TrafficPulse - Traffic Prediction Game",
    description: "Decentralized traffic prediction game powered by Stellar/Soroban. Predict traffic volume and win PULSE tokens!",
    type: "website",
    siteName: "TrafficPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrafficPulse",
    description: "Predict traffic volume and win PULSE tokens on Stellar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <WalletProvider>
            {children}
          </WalletProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}