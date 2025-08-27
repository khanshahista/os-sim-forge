import { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import CPUScheduling from '@/modules/cpu-scheduling/CPUScheduling';
import BankersAlgorithm from '@/modules/deadlock/BankersAlgorithm';
import PageReplacement from '@/modules/memory/PageReplacement';
import DiskScheduling from '@/modules/disk/DiskScheduling';
import MemoryAllocation from '@/modules/memory-allocation/MemoryAllocation';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard onModuleSelect={setActiveModule} />;
      case 'cpu-scheduling':
        return <CPUScheduling />;
      case 'deadlock':
        return <BankersAlgorithm />;
      case 'page-replacement':
        return <PageReplacement />;
      case 'disk-scheduling':
        return <DiskScheduling />;
      case 'memory-allocation':
        return <MemoryAllocation />;
      default:
        return <Dashboard onModuleSelect={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="pt-16">
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderModule()}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;