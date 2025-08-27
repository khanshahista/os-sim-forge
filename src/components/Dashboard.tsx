import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Cpu, 
  Shield, 
  HardDrive, 
  Database, 
  MemoryStick,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  onModuleSelect: (module: string) => void;
}

const modules = [
  {
    id: 'cpu-scheduling',
    name: 'CPU Scheduling',
    icon: Cpu,
    description: 'Simulate FCFS, SJF, Round Robin, and more with animated Gantt charts',
    color: 'from-primary to-blue-600',
    features: ['FCFS', 'SJF', 'Round Robin', 'Priority', 'Multilevel Queue']
  },
  {
    id: 'deadlock',
    name: "Banker's Algorithm",
    icon: Shield,
    description: 'Visualize deadlock detection and prevention with safety sequences',
    color: 'from-secondary to-purple-600',
    features: ['Resource Matrix', 'Safety Check', 'Need Calculation', 'Safe Sequence']
  },
  {
    id: 'page-replacement',
    name: 'Page Replacement',
    icon: HardDrive,
    description: 'Watch FIFO, LRU, and Optimal algorithms handle page faults',
    color: 'from-accent to-green-600',
    features: ['FIFO', 'LRU', 'Optimal', 'Page Fault Counter']
  },
  {
    id: 'disk-scheduling',
    name: 'Disk Scheduling',
    icon: Database,
    description: 'Animate disk head movement with FCFS, SCAN, and more',
    color: 'from-warning to-orange-600',
    features: ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK']
  },
  {
    id: 'memory-allocation',
    name: 'Memory Allocation',
    icon: MemoryStick,
    description: 'See First Fit and Best Fit algorithms manage memory blocks',
    color: 'from-destructive to-red-600',
    features: ['First Fit', 'Best Fit', 'Fragmentation View']
  }
];

const Dashboard = ({ onModuleSelect }: DashboardProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4 text-gradient">
          OS Algorithm Simulator
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Interactive visualization of operating system algorithms with smooth animations and real-time statistics
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => {
          const Icon = module.icon;
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="glass-card cursor-pointer group relative overflow-hidden h-full"
                onClick={() => onModuleSelect(module.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                     style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                />
                
                <div className="p-6">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${module.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 flex items-center justify-between">
                    {module.name}
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    {module.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {module.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center space-x-2 text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">Select a module to begin simulation</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;