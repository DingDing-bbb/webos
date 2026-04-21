import React from 'react';
import { createRoot } from 'react-dom/client';
const App = () => <div>Hello WebOS!</div>;
const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
