import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Legalize - Legal Services Platform',
  description: 'Professional legal services at your fingertips',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
