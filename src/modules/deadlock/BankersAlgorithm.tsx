import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, RotateCcw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { checkSafety, BankersData } from '@/utils/bankers-algorithm';

const BankersAlgorithm = () => {
  const [numProcesses, setNumProcesses] = useState(5);
  const [numResources, setNumResources] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [safeSequence, setSafeSequence] = useState<string[]>([]);
  const [isSafe, setIsSafe] = useState<boolean | null>(null);
  
  // Initialize matrices with sample data
  const [available, setAvailable] = useState([3, 3, 2]);
  const [maximum, setMaximum] = useState([
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3]
  ]);
  const [allocation, setAllocation] = useState([
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2]
  ]);
  const [need, setNeed] = useState<number[][]>([]);
  const [steps, setSteps] = useState<any[]>([]);

  const calculateNeed = () => {
    const newNeed = [];
    for (let i = 0; i < numProcesses; i++) {
      const row = [];
      for (let j = 0; j < numResources; j++) {
        row.push(maximum[i][j] - allocation[i][j]);
      }
      newNeed.push(row);
    }
    setNeed(newNeed);
    return newNeed;
  };

  const runAlgorithm = () => {
    const needMatrix = calculateNeed();
    const data: BankersData = {
      processes: numProcesses,
      resources: numResources,
      available: [...available],
      maximum,
      allocation,
      need: needMatrix
    };
    
    const result = checkSafety(data);
    setSafeSequence(result.safeSequence);
    setIsSafe(result.isSafe);
    setSteps(result.steps);
    setIsRunning(true);
    animateSteps(result.steps);
  };

  const animateSteps = async (stepsData: any[]) => {
    for (let i = 0; i < stepsData.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentStep(-1);
    setSafeSequence([]);
    setIsSafe(null);
    setSteps([]);
  };

  const updateMatrix = (matrix: number[][], row: number, col: number, value: string) => {
    const newMatrix = [...matrix];
    newMatrix[row][col] = parseInt(value) || 0;
    return newMatrix;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-gradient"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Banker's Algorithm - Deadlock Avoidance
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <Card className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <Label>Processes: {numProcesses}</Label>
              <Input
                type="range"
                min="2"
                max="10"
                value={numProcesses}
                onChange={(e) => setNumProcesses(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <Label>Resources: {numResources}</Label>
              <Input
                type="range"
                min="2"
                max="5"
                value={numResources}
                onChange={(e) => setNumResources(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <Label>Available Resources</Label>
              <div className="flex gap-2">
                {available.map((val, i) => (
                  <Input
                    key={i}
                    type="number"
                    value={val}
                    onChange={(e) => {
                      const newAvailable = [...available];
                      newAvailable[i] = parseInt(e.target.value) || 0;
                      setAvailable(newAvailable);
                    }}
                    className="w-20"
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={runAlgorithm} 
                className="flex-1 bg-gradient-primary"
              >
                <Play className="w-4 h-4 mr-2" />
                Check Safety
              </Button>
              <Button onClick={reset} variant="outline">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Matrices */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Allocation Matrix */}
            <Card className="glass-card p-4">
              <h3 className="text-lg font-semibold mb-3">Allocation Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="p-1"></th>
                      {Array.from({ length: numResources }, (_, i) => (
                        <th key={i} className="p-1">R{i}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: numProcesses }, (_, i) => (
                      <tr key={i}>
                        <td className="p-1 font-semibold">P{i}</td>
                        {Array.from({ length: numResources }, (_, j) => (
                          <td key={j} className="p-1">
                            <Input
                              type="number"
                              value={allocation[i]?.[j] || 0}
                              onChange={(e) => setAllocation(updateMatrix(allocation, i, j, e.target.value))}
                              className="w-12 h-8 text-center"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Maximum Matrix */}
            <Card className="glass-card p-4">
              <h3 className="text-lg font-semibold mb-3">Maximum Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="p-1"></th>
                      {Array.from({ length: numResources }, (_, i) => (
                        <th key={i} className="p-1">R{i}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: numProcesses }, (_, i) => (
                      <tr key={i}>
                        <td className="p-1 font-semibold">P{i}</td>
                        {Array.from({ length: numResources }, (_, j) => (
                          <td key={j} className="p-1">
                            <Input
                              type="number"
                              value={maximum[i]?.[j] || 0}
                              onChange={(e) => setMaximum(updateMatrix(maximum, i, j, e.target.value))}
                              className="w-12 h-8 text-center"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Need Matrix (calculated) */}
          {need.length > 0 && (
            <Card className="glass-card p-4">
              <h3 className="text-lg font-semibold mb-3">Need Matrix (Calculated)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="p-2"></th>
                      {Array.from({ length: numResources }, (_, i) => (
                        <th key={i} className="p-2">R{i}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {need.map((row, i) => (
                      <motion.tr 
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={steps[currentStep]?.process === i ? 'bg-primary/20' : ''}
                      >
                        <td className="p-2 font-semibold">P{i}</td>
                        {row.map((val, j) => (
                          <td key={j} className="p-2 text-center">{val}</td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Result */}
          {isSafe !== null && (
            <Card className={`glass-card p-6 ${isSafe ? 'border-success' : 'border-destructive'}`}>
              <div className="flex items-center gap-4 mb-4">
                {isSafe ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-success" />
                    <div>
                      <h3 className="text-xl font-semibold">System is SAFE</h3>
                      <p className="text-muted-foreground">A safe sequence exists</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-destructive" />
                    <div>
                      <h3 className="text-xl font-semibold">System is UNSAFE</h3>
                      <p className="text-muted-foreground">Potential deadlock detected</p>
                    </div>
                  </>
                )}
              </div>
              
              {isSafe && safeSequence.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Safe Sequence:</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {safeSequence.map((process, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className="flex items-center"
                      >
                        <div className="px-4 py-2 bg-gradient-primary text-primary-foreground rounded-lg font-semibold">
                          {process}
                        </div>
                        {index < safeSequence.length - 1 && (
                          <span className="mx-2">→</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankersAlgorithm;