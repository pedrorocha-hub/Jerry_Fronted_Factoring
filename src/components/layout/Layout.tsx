import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-black text-white min-h-screen">{children}</div>;
};

export default Layout;