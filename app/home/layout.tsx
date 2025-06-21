export const metadata = {
  title: 'SpaceJump',
  description: 'Космическая аркада в Telegram',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
