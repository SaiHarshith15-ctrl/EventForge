import { Toaster } from 'react-hot-toast';

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3400,
        style: {
          background: '#17153A',
          color: '#fff',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: 600,
          padding: '12px 16px',
          boxShadow: '0 12px 32px rgba(23,21,58,0.25)',
        },
        success: { iconTheme: { primary: '#17C3A2', secondary: '#fff' } },
        error: { iconTheme: { primary: '#FF7A3D', secondary: '#fff' } },
      }}
    />
  );
}
