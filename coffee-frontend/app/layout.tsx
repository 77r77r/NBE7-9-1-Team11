// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="ko">
        <head>
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css"
            rel="stylesheet"
          />
        </head>
        <body style={{ background: "#ddd" }}>{children}</body>
      </html>
    );
  }
  