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
import { Play, RotateCcw, HardDrive } from 'lucide-react';
import DiskVisualization from './DiskVisualization';
import { 
  scheduleFCFS as diskFCFS,
  scheduleSSTF,
  scheduleSCAN,
  scheduleCSCAN,
  scheduleLOOK,
  scheduleCLOOK
} from '@/utils/disk-algorithms';

const DiskScheduling = () => {
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [requestQueue, setRequestQueue] = useState('98 183 37 122 14 124 65 67');
  const [headPosition, setHeadPosition] = useState(53);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [diskSize, setDiskSize] = useState(200);
  const [isRunning, setIsRunning] = useState(false);
  const [seekSequence, setSeekSequence] = useState<number[]>([]);
  const [totalSeekTime, setTotalSeekTime] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(headPosition);

  const parseRequestQueue = () => {
    return requestQueue.split(' ').map(s => parseInt(s)).filter(n => !isNaN(n) && n < diskSize);
  };

  const runSimulation = async () => {
    const requests = parseRequestQueue();
    if (requests.length === 0) return;

    let result;
    switch (algorithm) {
      case 'fcfs':
        result = diskFCFS(requests, headPosition);
        break;
      case 'sstf':
        result = scheduleSSTF(requests, headPosition);
        break;
      case 'scan':
        result = scheduleSCAN(requests, headPosition, diskSize, direction);
        break;
      case 'cscan':
        result = scheduleCSCAN(requests, headPosition, diskSize, direction);
        break;
      case 'look':
        result = scheduleLOOK(requests, headPosition, direction);
        break;
      case 'clook':
        result = scheduleCLOOK(requests, headPosition, direction);
        break;
      default:
        result = diskFCFS(requests, headPosition);
    }

    setSeekSequence(result.sequence);
    setTotalSeekTime(result.totalSeekTime);
    setIsRunning(true);
    
    // Animate disk head movement
    for (let i = 0; i < result.sequence.length; i++) {
      setCurrentPosition(result.sequence[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
      if (!isRunning) break;
    }
    
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setSeekSequence([]);
    setTotalSeekTime(0);
    setCurrentPosition(headPosition);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-gradient"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Disk Scheduling Algorithms
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
                  <SelectItem value="fcfs">First Come First Serve (FCFS)</SelectItem>
                  <SelectItem value="sstf">Shortest Seek Time First (SSTF)</SelectItem>
                  <SelectItem value="scan">SCAN (Elevator)</SelectItem>
                  <SelectItem value="cscan">C-SCAN</SelectItem>
                  <SelectItem value="look">LOOK</SelectItem>
                  <SelectItem value="clook">C-LOOK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="queue">Request Queue</Label>
              <Input
                id="queue"
                value={requestQueue}
                onChange={(e) => setRequestQueue(e.target.value)}
                placeholder="Enter space-separated cylinder numbers"
              />
            </div>

            <div>
              <Label htmlFor="head">Initial Head Position</Label>
              <Input
                id="head"
                type="number"
                value={headPosition}
                onChange={(e) => setHeadPosition(parseInt(e.target.value) || 0)}
                min="0"
                max={diskSize - 1}
              />
            </div>

            <div>
              <Label htmlFor="size">Disk Size (cylinders)</Label>
              <Input
                id="size"
                type="number"
                value={diskSize}
                onChange={(e) => setDiskSize(parseInt(e.target.value) || 200)}
                min="50"
                max="500"
              />
            </div>

            {(algorithm === 'scan' || algorithm === 'cscan' || algorithm === 'look' || algorithm === 'clook') && (
              <div>
                <Label htmlFor="direction">Initial Direction</Label>
                <Select value={direction} onValueChange={(v: 'left' | 'right') => setDirection(v)}>
                  <SelectTrigger id="direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left (towards 0)</SelectItem>
                    <SelectItem value="right">Right (towards max)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={runSimulation} 
                className="flex-1 bg-gradient-primary"
                disabled={isRunning}
              >
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
              <Button onClick={reset} variant="outline">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Disk Visualization */}
          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Disk Head Movement
            </h2>
            <DiskVisualization
              diskSize={diskSize}
              requests={parseRequestQueue()}
              currentPosition={currentPosition}
              seekSequence={seekSequence}
            />
          </Card>

          {/* Seek Sequence */}
          {seekSequence.length > 0 && (
            <Card className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Seek Sequence</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-2 bg-primary/20 rounded-lg font-mono"
                >
                  {headPosition}
                </motion.div>
                {seekSequence.map((position, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center"
                  >
                    <span className="mx-2">→</span>
                    <div className={`px-3 py-2 rounded-lg font-mono ${
                      currentPosition === position
                        ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                        : 'bg-card border border-border'
                    }`}>
                      {position}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Statistics */}
          {totalSeekTime > 0 && (
            <Card className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                  <p className="text-sm text-muted-foreground mb-2">Total Seek Time</p>
                  <p className="text-3xl font-bold">{totalSeekTime}</p>
                  <p className="text-xs text-muted-foreground">cylinders</p>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10">
                  <p className="text-sm text-muted-foreground mb-2">Average Seek Time</p>
                  <p className="text-3xl font-bold">
                    {(totalSeekTime / seekSequence.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">cylinders/request</p>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10">
                  <p className="text-sm text-muted-foreground mb-2">Requests Served</p>
                  <p className="text-3xl font-bold">{seekSequence.length}</p>
                  <p className="text-xs text-muted-foreground">requests</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiskScheduling;