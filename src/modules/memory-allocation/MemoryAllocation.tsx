import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, RotateCcw, Plus, Trash2, MemoryStick } from 'lucide-react';
import { allocateFirstFit, allocateBestFit } from '@/utils/memory-allocation';

interface MemoryBlock {
  id: number;
  size: number;
  allocated: boolean;
  processId?: number;
  processSize?: number;
}

interface Process {
  id: number;
  size: number;
  allocated: boolean;
  blockId?: number;
}

const MemoryAllocation = () => {
  const [algorithm, setAlgorithm] = useState('firstfit');
  const [blocks, setBlocks] = useState<MemoryBlock[]>([
    { id: 0, size: 100, allocated: false },
    { id: 1, size: 500, allocated: false },
    { id: 2, size: 200, allocated: false },
    { id: 3, size: 300, allocated: false },
    { id: 4, size: 600, allocated: false },
  ]);
  const [processes, setProcesses] = useState<Process[]>([
    { id: 0, size: 212, allocated: false },
    { id: 1, size: 417, allocated: false },
    { id: 2, size: 112, allocated: false },
    { id: 3, size: 426, allocated: false },
  ]);
  const [newBlockSize, setNewBlockSize] = useState('');
  const [newProcessSize, setNewProcessSize] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const runAllocation = async () => {
    setIsRunning(true);
    const blocksCopy = blocks.map(b => ({ ...b, allocated: false, processId: undefined, processSize: undefined }));
    const processesCopy = processes.map(p => ({ ...p, allocated: false, blockId: undefined }));
    
    let result;
    if (algorithm === 'firstfit') {
      result = allocateFirstFit(blocksCopy, processesCopy);
    } else {
      result = allocateBestFit(blocksCopy, processesCopy);
    }
    
    // Animate allocation
    for (let i = 0; i < result.steps.length; i++) {
      setCurrentStep(i);
      const step = result.steps[i];
      setBlocks([...step.blocks]);
      setProcesses([...step.processes]);
      await new Promise(resolve => setTimeout(resolve, 800));
      if (!isRunning) break;
    }
    
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentStep(-1);
    setBlocks(blocks.map(b => ({ ...b, allocated: false, processId: undefined, processSize: undefined })));
    setProcesses(processes.map(p => ({ ...p, allocated: false, blockId: undefined })));
  };

  const addBlock = () => {
    const size = parseInt(newBlockSize);
    if (size > 0) {
      setBlocks([...blocks, { id: blocks.length, size, allocated: false }]);
      setNewBlockSize('');
    }
  };

  const removeBlock = (id: number) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const addProcess = () => {
    const size = parseInt(newProcessSize);
    if (size > 0) {
      setProcesses([...processes, { id: processes.length, size, allocated: false }]);
      setNewProcessSize('');
    }
  };

  const removeProcess = (id: number) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  const getFragmentation = () => {
    return blocks.reduce((total, block) => {
      if (block.allocated && block.processSize) {
        return total + (block.size - block.processSize);
      }
      return total;
    }, 0);
  };

  const getTotalMemory = () => {
    return blocks.reduce((total, block) => total + block.size, 0);
  };

  const getAllocatedMemory = () => {
    return blocks.reduce((total, block) => {
      if (block.allocated && block.processSize) {
        return total + block.processSize;
      }
      return total;
    }, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-gradient"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Memory Allocation Algorithms
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <Card className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="algorithm">Algorithm</Label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger id="algorithm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firstfit">First Fit</SelectItem>
                  <SelectItem value="bestfit">Best Fit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Memory Blocks</Label>
              <div className="space-y-2">
                {blocks.map((block) => (
                  <div key={block.id} className="flex items-center gap-2">
                    <span className="text-sm flex-1">
                      Block {block.id}: {block.size} KB
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeBlock(block.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Size (KB)"
                    value={newBlockSize}
                    onChange={(e) => setNewBlockSize(e.target.value)}
                  />
                  <Button onClick={addBlock} variant="secondary">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Processes</Label>
              <div className="space-y-2">
                {processes.map((process) => (
                  <div key={process.id} className="flex items-center gap-2">
                    <span className="text-sm flex-1">
                      P{process.id}: {process.size} KB
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeProcess(process.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Size (KB)"
                    value={newProcessSize}
                    onChange={(e) => setNewProcessSize(e.target.value)}
                  />
                  <Button onClick={addProcess} variant="secondary">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={runAllocation} 
                className="flex-1 bg-gradient-primary"
                disabled={isRunning || blocks.length === 0 || processes.length === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Allocate
              </Button>
              <Button onClick={reset} variant="outline">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Memory Blocks Visualization */}
          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MemoryStick className="w-5 h-5" />
              Memory Blocks
            </h2>
            <div className="space-y-4">
              {blocks.map((block, index) => {
                const maxSize = Math.max(...blocks.map(b => b.size));
                const widthPercentage = (block.size / maxSize) * 100;
                const fillPercentage = block.processSize ? (block.processSize / block.size) * 100 : 0;
                
                return (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-semibold w-20">Block {block.id}</span>
                      <span className="text-xs text-muted-foreground">
                        {block.size} KB
                        {block.allocated && block.processSize && (
                          <span className="ml-2">
                            (P{block.processId}: {block.processSize} KB)
                          </span>
                        )}
                      </span>
                    </div>
                    <div 
                      className="relative h-12 bg-muted/20 rounded-lg overflow-hidden border-2 border-border"
                      style={{ width: `${widthPercentage}%` }}
                    >
                      {block.allocated && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${fillPercentage}%` }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center"
                        >
                          <span className="text-xs font-bold text-primary-foreground">
                            P{block.processId}
                          </span>
                        </motion.div>
                      )}
                      {block.allocated && fillPercentage < 100 && (
                        <div 
                          className="absolute inset-y-0 bg-destructive/20 border-l-2 border-destructive"
                          style={{ left: `${fillPercentage}%`, right: 0 }}
                        >
                          <span className="text-xs text-destructive absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            {block.size - (block.processSize || 0)} KB
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {/* Process Status */}
          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Process Allocation Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {processes.map((process) => (
                <motion.div
                  key={process.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-lg text-center ${
                    process.allocated
                      ? 'bg-gradient-to-br from-success/20 to-success/10 border-2 border-success'
                      : 'bg-muted/20 border-2 border-dashed border-muted'
                  }`}
                >
                  <p className="font-semibold">P{process.id}</p>
                  <p className="text-sm text-muted-foreground">{process.size} KB</p>
                  {process.allocated && (
                    <p className="text-xs mt-1 text-success">→ Block {process.blockId}</p>
                  )}
                  {!process.allocated && currentStep >= 0 && (
                    <p className="text-xs mt-1 text-destructive">Not allocated</p>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Statistics */}
          {currentStep >= 0 && (
            <Card className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Memory Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                  <p className="text-sm text-muted-foreground mb-2">Total Memory</p>
                  <p className="text-2xl font-bold">{getTotalMemory()} KB</p>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-br from-success/20 to-success/10">
                  <p className="text-sm text-muted-foreground mb-2">Allocated</p>
                  <p className="text-2xl font-bold">{getAllocatedMemory()} KB</p>
                  <p className="text-xs text-muted-foreground">
                    {((getAllocatedMemory() / getTotalMemory()) * 100).toFixed(1)}%
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-br from-destructive/20 to-destructive/10">
                  <p className="text-sm text-muted-foreground mb-2">Internal Fragmentation</p>
                  <p className="text-2xl font-bold">{getFragmentation()} KB</p>
                  <p className="text-xs text-muted-foreground">
                    {((getFragmentation() / getTotalMemory()) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryAllocation;