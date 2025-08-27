import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Cpu, 
  Shield, 
  HardDrive, 
  Database, 
  MemoryStick,
  LayoutDashboard,
  Moon,
  Sun
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavigationProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const modules = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'cpu-scheduling', name: 'CPU Scheduling', icon: Cpu },
  { id: 'deadlock', name: 'Deadlock', icon: Shield },
  { id: 'page-replacement', name: 'Page Replacement', icon: HardDrive },
  { id: 'disk-scheduling', name: 'Disk Scheduling', icon: Database },
  { id: 'memory-allocation', name: 'Memory Allocation', icon: MemoryStick },
];

const Navigation = ({ activeModule, onModuleChange }: NavigationProps) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <motion.h1 
              className="text-xl font-bold text-gradient"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              OS Simulator
            </motion.h1>
            
            <div className="hidden md:flex items-center space-x-2">
              {modules.map((module, index) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;
                
                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onModuleChange(module.id)}
                      className={`${
                        isActive 
                          ? 'bg-gradient-primary text-primary-foreground shadow-glow' 
                          : 'hover:bg-muted/50'
                      } transition-all duration-300`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {module.name}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="hover:bg-muted/50"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;