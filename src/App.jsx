import { useState } from 'react';

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background p-8 or py-16 flex flex-col items-center justify-center space-y-12">
      {/* Header section with text gradient */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          VaxTrack <br />
          <span className="text-gradient">Vaccination System</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          This is a quick preview of our new modern global styling, fonts (Inter & Outfit), and Tailwind CSS theme config.
        </p>
      </div>

      {/* Showcase area for UI tokens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        
        {/* Card 1: Buttons and Actions */}
        <div className="glass-card p-6 flex flex-col space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Buttons</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Interactive elements.</p>
            <div className="flex flex-col space-y-3">
              <button className="btn-primary">Primary Action</button>
              <button className="btn-secondary">Secondary Action</button>
              <button className="btn-outline">Outline Action</button>
            </div>
          </div>
        </div>

        {/* Card 2: Inputs */}
        <div className="glass-card p-6 flex flex-col space-y-6">
           <div>
            <h3 className="text-xl font-bold mb-1">Forms</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Inputs and selections.</p>
            <div className="flex flex-col space-y-4">
              <input type="text" placeholder="Email address" className="input-field" />
              <input type="password" placeholder="Password" className="input-field" />
            </div>
          </div>
        </div>

        {/* Card 3: Color Palette semantic meaning */}
        <div className="glass-card p-6 flex flex-col space-y-6">
           <div>
            <h3 className="text-xl font-bold mb-1">Status Colors</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Semantic indicators.</p>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-500 rounded-xl">
                <span className="font-medium">Success state</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-warning-100 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500 rounded-xl">
                <span className="font-medium">Warning state</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-danger-100 text-danger-700 dark:bg-danger-500/10 dark:text-danger-500 rounded-xl">
                <span className="font-medium">Danger state</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>

      <button 
        onClick={toggleTheme}
        className="fixed bottom-8 right-8 btn-primary px-4 py-3 rounded-full shadow-lg"
      >
        Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>
    </div>
  );
}

export default App;
