export interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  remainingTime: number;
  waitingTime?: number;
  turnaroundTime?: number;
  completionTime?: number;
}

export interface GanttSegment {
  process: string;
  startTime: number;
  endTime: number;
}

export interface SchedulingResult {
  gantt: GanttSegment[];
  statistics: {
    avgWaitingTime: number;
    avgTurnaroundTime: number;
    totalCompletionTime: number;
    cpuUtilization: number;
  };
  processes: Process[];
}

export function scheduleFCFS(processes: Process[]): SchedulingResult {
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const gantt: GanttSegment[] = [];
  let currentTime = 0;

  sortedProcesses.forEach(process => {
    if (currentTime < process.arrivalTime) {
      currentTime = process.arrivalTime;
    }
    
    gantt.push({
      process: process.id,
      startTime: currentTime,
      endTime: currentTime + process.burstTime
    });
    
    process.completionTime = currentTime + process.burstTime;
    process.turnaroundTime = process.completionTime - process.arrivalTime;
    process.waitingTime = process.turnaroundTime - process.burstTime;
    
    currentTime = process.completionTime;
  });

  return calculateStatistics(sortedProcesses, gantt);
}

export function scheduleSJF(processes: Process[]): SchedulingResult {
  const gantt: GanttSegment[] = [];
  const remaining = [...processes];
  let currentTime = 0;
  const completed: Process[] = [];

  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrivalTime <= currentTime);
    
    if (available.length === 0) {
      currentTime = Math.min(...remaining.map(p => p.arrivalTime));
      continue;
    }
    
    available.sort((a, b) => a.burstTime - b.burstTime);
    const process = available[0];
    
    gantt.push({
      process: process.id,
      startTime: currentTime,
      endTime: currentTime + process.burstTime
    });
    
    process.completionTime = currentTime + process.burstTime;
    process.turnaroundTime = process.completionTime - process.arrivalTime;
    process.waitingTime = process.turnaroundTime - process.burstTime;
    
    currentTime = process.completionTime;
    completed.push(process);
    remaining.splice(remaining.indexOf(process), 1);
  }

  return calculateStatistics(completed, gantt);
}

export function scheduleRoundRobin(processes: Process[], quantum: number): SchedulingResult {
  const gantt: GanttSegment[] = [];
  const queue: Process[] = [];
  const remaining = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let currentTime = 0;
  const completed: Process[] = [];

  // Initialize
  remaining.forEach(p => {
    p.remainingTime = p.burstTime;
  });

  while (remaining.length > 0 || queue.length > 0) {
    // Add newly arrived processes to queue
    while (remaining.length > 0 && remaining[0].arrivalTime <= currentTime) {
      queue.push(remaining.shift()!);
    }

    if (queue.length === 0) {
      currentTime = remaining[0]?.arrivalTime || currentTime;
      continue;
    }

    const process = queue.shift()!;
    const executionTime = Math.min(quantum, process.remainingTime);
    
    gantt.push({
      process: process.id,
      startTime: currentTime,
      endTime: currentTime + executionTime
    });

    currentTime += executionTime;
    process.remainingTime -= executionTime;

    // Add newly arrived processes before re-adding current process
    while (remaining.length > 0 && remaining[0].arrivalTime <= currentTime) {
      queue.push(remaining.shift()!);
    }

    if (process.remainingTime > 0) {
      queue.push(process);
    } else {
      process.completionTime = currentTime;
      process.turnaroundTime = process.completionTime - process.arrivalTime;
      process.waitingTime = process.turnaroundTime - process.burstTime;
      completed.push(process);
    }
  }

  return calculateStatistics(completed, gantt);
}

export function schedulePriority(processes: Process[]): SchedulingResult {
  const gantt: GanttSegment[] = [];
  const remaining = [...processes];
  let currentTime = 0;
  const completed: Process[] = [];

  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrivalTime <= currentTime);
    
    if (available.length === 0) {
      currentTime = Math.min(...remaining.map(p => p.arrivalTime));
      continue;
    }
    
    available.sort((a, b) => a.priority - b.priority);
    const process = available[0];
    
    gantt.push({
      process: process.id,
      startTime: currentTime,
      endTime: currentTime + process.burstTime
    });
    
    process.completionTime = currentTime + process.burstTime;
    process.turnaroundTime = process.completionTime - process.arrivalTime;
    process.waitingTime = process.turnaroundTime - process.burstTime;
    
    currentTime = process.completionTime;
    completed.push(process);
    remaining.splice(remaining.indexOf(process), 1);
  }

  return calculateStatistics(completed, gantt);
}

function calculateStatistics(processes: Process[], gantt: GanttSegment[]): SchedulingResult {
  const totalWaitingTime = processes.reduce((sum, p) => sum + (p.waitingTime || 0), 0);
  const totalTurnaroundTime = processes.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0);
  const totalCompletionTime = gantt[gantt.length - 1]?.endTime || 0;
  const totalBurstTime = processes.reduce((sum, p) => sum + p.burstTime, 0);

  return {
    gantt,
    processes,
    statistics: {
      avgWaitingTime: totalWaitingTime / processes.length,
      avgTurnaroundTime: totalTurnaroundTime / processes.length,
      totalCompletionTime,
      cpuUtilization: (totalBurstTime / totalCompletionTime) * 100
    }
  };
}