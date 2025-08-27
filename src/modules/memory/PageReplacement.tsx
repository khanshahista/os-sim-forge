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
import { Play, Pause, SkipForward, RotateCcw, AlertTriangle } from 'lucide-react';
import { simulateFIFO, simulateLRU, simulateOptimal } from '@/utils/page-replacement';

const PageReplacement = () => {
  const [algorithm, setAlgorithm] = useState('fifo');
  const [referenceString, setReferenceString] = useState('7 0 1 2 0 3 0 4 2 3 0 3 2');
  const [frameSize, setFrameSize] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [frames, setFrames] = useState<(number | null)[]>([]);
  const [pageFaults, setPageFaults] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  const parseReferenceString = () => {
    return referenceString.split(' ').map(s => parseInt(s)).filter(n => !isNaN(n));
  };

  const runSimulation = async () => {
    const pages = parseReferenceString();
    if (pages.length === 0) return;

    let result;
    switch (algorithm) {
      case 'fifo':
        result = simulateFIFO(pages, frameSize);
        break;
      case 'lru':
        result = simulateLRU(pages, frameSize);
        break;
      case 'optimal':
        result = simulateOptimal(pages, frameSize);
        break;
      default:
        result = simulateFIFO(pages, frameSize);
    }

    setHistory(result.history);
    setPageFaults(result.pageFaults);
    setIsRunning(true);
    
    // Animate through steps
    for (let i = 0; i < result.history.length; i++) {
      setCurrentStep(i);
      setFrames(result.history[i].frames);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      if (!isRunning) break;
    }
    
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setFrames([]);
    setPageFaults(0);
    setHistory([]);
  };

  const stepForward = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
      setFrames(history[currentStep + 1].frames);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-gradient"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Page Replacement Algorithms
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
                  <SelectItem value="fifo">First In First Out (FIFO)</SelectItem>
                  <SelectItem value="lru">Least Recently Used (LRU)</SelectItem>
                  <SelectItem value="optimal">Optimal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reference">Reference String</Label>
              <Input
                id="reference"
                value={referenceString}
                onChange={(e) => setReferenceString(e.target.value)}
                placeholder="Enter space-separated page numbers"
              />
            </div>

            <div>
              <Label htmlFor="frames">Number of Frames: {frameSize}</Label>
              <Input
                id="frames"
                type="range"
                min="1"
                max="7"
                value={frameSize}
                onChange={(e) => setFrameSize(parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="speed">Animation Speed: {animationSpeed}ms</Label>
              <Input
                id="speed"
                type="range"
                min="100"
                max="2000"
                step="100"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={runSimulation} 
                className="flex-1 bg-gradient-primary"
                disabled={isRunning}
              >
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
              <Button 
                onClick={stepForward}
                variant="outline"
                disabled={isRunning || currentStep >= history.length - 1}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button onClick={reset} variant="outline">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reference String Display */}
          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Reference String</h2>
            <div className="flex gap-2 flex-wrap">
              {parseReferenceString().map((page, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono font-semibold ${
                    history[currentStep]?.currentPage === page && history[currentStep]?.index === index
                      ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                      : index < (history[currentStep]?.index || 0)
                      ? 'bg-muted/50 text-muted-foreground'
                      : 'bg-card border border-border'
                  }`}
                >
                  {page}
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Frame Visualization */}
          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Memory Frames</h2>
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: frameSize }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-muted-foreground w-20">
                      Frame {i}
                    </span>
                    <motion.div
                      className={`flex-1 h-16 rounded-lg flex items-center justify-center font-mono text-2xl font-bold ${
                        frames[i] !== null && frames[i] !== undefined
                          ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary'
                          : 'bg-muted/20 border-2 border-dashed border-muted'
                      }`}
                      animate={
                        history[currentStep]?.replacedFrame === i
                          ? { scale: [1, 1.1, 1], borderColor: ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--primary))'] }
                          : {}
                      }
                      transition={{ duration: 0.5 }}
                    >
                      {frames[i] !== null && frames[i] !== undefined ? frames[i] : '—'}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Statistics */}
          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-destructive/20 to-destructive/10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <p className="text-sm text-muted-foreground">Page Faults</p>
                </div>
                <p className="text-3xl font-bold">{pageFaults}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-gradient-to-br from-success/20 to-success/10">
                <p className="text-sm text-muted-foreground mb-2">Page Hits</p>
                <p className="text-3xl font-bold">
                  {history.length > 0 ? history.length - pageFaults : 0}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                <p className="text-sm text-muted-foreground mb-2">Hit Rate</p>
                <p className="text-3xl font-bold">
                  {history.length > 0 
                    ? `${(((history.length - pageFaults) / history.length) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>

            {history.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {history.length}
                </p>
                <div className="w-full bg-muted/20 rounded-full h-2 mt-2">
                  <motion.div
                    className="bg-gradient-primary h-2 rounded-full"
                    style={{ width: `${((currentStep + 1) / history.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PageReplacement;