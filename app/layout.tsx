
import React from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'SpaceJump',
  description: 'Cosmic arcade game',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
