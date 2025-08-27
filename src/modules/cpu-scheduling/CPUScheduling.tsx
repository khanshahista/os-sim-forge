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
import { Play, Pause, SkipForward, RotateCcw, Plus, Trash2 } from 'lucide-react';
import GanttChart from './GanttChart';
import { Process, scheduleFCFS, scheduleSJF, scheduleRoundRobin, schedulePriority } from '@/utils/cpu-algorithms';

const CPUScheduling = () => {
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [processes, setProcesses] = useState<Process[]>([
    { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2, remainingTime: 5 },
    { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, remainingTime: 3 },
    { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 3, remainingTime: 8 },
    { id: 'P4', arrivalTime: 3, burstTime: 6, priority: 2, remainingTime: 6 },
  ]);
  const [quantum, setQuantum] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [ganttData, setGanttData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  // New process form state
  const [newProcess, setNewProcess] = useState({
    id: '',
    arrivalTime: 0,
    burstTime: 0,
    priority: 1,
  });

  const runSimulation = () => {
    let result;
    const processesCopy = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
    
    switch (algorithm) {
      case 'fcfs':
        result = scheduleFCFS(processesCopy);
        break;
      case 'sjf':
        result = scheduleSJF(processesCopy);
        break;
      case 'rr':
        result = scheduleRoundRobin(processesCopy, quantum);
        break;
      case 'priority':
        result = schedulePriority(processesCopy);
        break;
      default:
        result = scheduleFCFS(processesCopy);
    }
    
    setGanttData(result.gantt);
    setStatistics(result.statistics);
    setIsRunning(true);
  };

  const addProcess = () => {
    if (newProcess.id && newProcess.burstTime > 0) {
      setProcesses([...processes, {
        ...newProcess,
        remainingTime: newProcess.burstTime
      }]);
      setNewProcess({ id: '', arrivalTime: 0, burstTime: 0, priority: 1 });
    }
  };

  const removeProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  const reset = () => {
    setCurrentTime(0);
    setIsRunning(false);
    setGanttData([]);
    setStatistics(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-gradient"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        CPU Scheduling Algorithms
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <Card className="glass-card p-6 lg:col-span-1">
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
                  <SelectItem value="sjf">Shortest Job First (SJF)</SelectItem>
                  <SelectItem value="rr">Round Robin (RR)</SelectItem>
                  <SelectItem value="priority">Priority Scheduling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {algorithm === 'rr' && (
              <div>
                <Label htmlFor="quantum">Time Quantum</Label>
                <Input
                  id="quantum"
                  type="number"
                  value={quantum}
                  onChange={(e) => setQuantum(parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Add Process</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Process ID"
                  value={newProcess.id}
                  onChange={(e) => setNewProcess({ ...newProcess, id: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Burst Time"
                  value={newProcess.burstTime || ''}
                  onChange={(e) => setNewProcess({ ...newProcess, burstTime: parseInt(e.target.value) || 0 })}
                />
                <Input
                  type="number"
                  placeholder="Arrival Time"
                  value={newProcess.arrivalTime || ''}
                  onChange={(e) => setNewProcess({ ...newProcess, arrivalTime: parseInt(e.target.value) || 0 })}
                />
                <Input
                  type="number"
                  placeholder="Priority"
                  value={newProcess.priority || ''}
                  onChange={(e) => setNewProcess({ ...newProcess, priority: parseInt(e.target.value) || 1 })}
                />
              </div>
              <Button onClick={addProcess} className="w-full" variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Process
              </Button>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={runSimulation} 
                className="flex-1 bg-gradient-primary"
                disabled={processes.length === 0}
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

        {/* Process Table & Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Process List */}
          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Process Queue</h2>
            <div className="space-y-2">
              {processes.map((process, index) => (
                <motion.div
                  key={process.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="grid grid-cols-4 gap-4 flex-1">
                    <span className="font-mono">{process.id}</span>
                    <span className="text-sm text-muted-foreground">AT: {process.arrivalTime}</span>
                    <span className="text-sm text-muted-foreground">BT: {process.burstTime}</span>
                    <span className="text-sm text-muted-foreground">P: {process.priority}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeProcess(process.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Gantt Chart */}
          {ganttData.length > 0 && (
            <Card className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>
              <GanttChart data={ganttData} />
            </Card>
          )}

          {/* Statistics */}
          {statistics && (
            <Card className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                  <p className="text-sm text-muted-foreground mb-1">Avg Waiting Time</p>
                  <p className="text-2xl font-bold">{statistics.avgWaitingTime.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10">
                  <p className="text-sm text-muted-foreground mb-1">Avg Turnaround Time</p>
                  <p className="text-2xl font-bold">{statistics.avgTurnaroundTime.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10">
                  <p className="text-sm text-muted-foreground mb-1">Total Completion Time</p>
                  <p className="text-2xl font-bold">{statistics.totalCompletionTime}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-warning/20 to-warning/10">
                  <p className="text-sm text-muted-foreground mb-1">CPU Utilization</p>
                  <p className="text-2xl font-bold">{statistics.cpuUtilization.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CPUScheduling;