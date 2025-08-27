export interface DiskSchedulingResult {
  sequence: number[];
  totalSeekTime: number;
}

export function scheduleFCFS(requests: number[], head: number): DiskSchedulingResult {
  const sequence = [...requests];
  let totalSeekTime = Math.abs(head - sequence[0]);
  
  for (let i = 1; i < sequence.length; i++) {
    totalSeekTime += Math.abs(sequence[i] - sequence[i - 1]);
  }
  
  return { sequence, totalSeekTime };
}

export function scheduleSSTF(requests: number[], head: number): DiskSchedulingResult {
  const sequence: number[] = [];
  const remaining = [...requests];
  let current = head;
  let totalSeekTime = 0;
  
  while (remaining.length > 0) {
    let minDistance = Infinity;
    let minIndex = 0;
    
    for (let i = 0; i < remaining.length; i++) {
      const distance = Math.abs(current - remaining[i]);
      if (distance < minDistance) {
        minDistance = distance;
        minIndex = i;
      }
    }
    
    totalSeekTime += minDistance;
    current = remaining[minIndex];
    sequence.push(current);
    remaining.splice(minIndex, 1);
  }
  
  return { sequence, totalSeekTime };
}

export function scheduleSCAN(requests: number[], head: number, diskSize: number, direction: 'left' | 'right'): DiskSchedulingResult {
  const sequence: number[] = [];
  const left = requests.filter(r => r < head).sort((a, b) => b - a);
  const right = requests.filter(r => r >= head).sort((a, b) => a - b);
  let totalSeekTime = 0;
  
  if (direction === 'right') {
    sequence.push(...right);
    if (left.length > 0) {
      sequence.push(diskSize - 1);
      sequence.push(...left);
      totalSeekTime = (diskSize - 1 - head) + (diskSize - 1 - left[left.length - 1]);
    } else {
      totalSeekTime = right[right.length - 1] - head;
    }
  } else {
    sequence.push(...left);
    if (right.length > 0) {
      sequence.push(0);
      sequence.push(...right);
      totalSeekTime = head + right[right.length - 1];
    } else {
      totalSeekTime = head - left[left.length - 1];
    }
  }
  
  return { sequence, totalSeekTime };
}

export function scheduleCSCAN(requests: number[], head: number, diskSize: number, direction: 'left' | 'right'): DiskSchedulingResult {
  const sequence: number[] = [];
  const sorted = [...requests].sort((a, b) => a - b);
  let totalSeekTime = 0;
  
  if (direction === 'right') {
    const right = sorted.filter(r => r >= head);
    const left = sorted.filter(r => r < head);
    sequence.push(...right);
    if (left.length > 0) {
      sequence.push(diskSize - 1, 0);
      sequence.push(...left);
      totalSeekTime = (diskSize - 1 - head) + diskSize - 1 + left[left.length - 1];
    } else {
      totalSeekTime = right[right.length - 1] - head;
    }
  }
  
  return { sequence, totalSeekTime };
}

export function scheduleLOOK(requests: number[], head: number, direction: 'left' | 'right'): DiskSchedulingResult {
  const sequence: number[] = [];
  const left = requests.filter(r => r < head).sort((a, b) => b - a);
  const right = requests.filter(r => r >= head).sort((a, b) => a - b);
  let totalSeekTime = 0;
  
  if (direction === 'right') {
    sequence.push(...right, ...left);
    if (left.length > 0) {
      totalSeekTime = right[right.length - 1] - head + right[right.length - 1] - left[left.length - 1];
    } else {
      totalSeekTime = right[right.length - 1] - head;
    }
  } else {
    sequence.push(...left, ...right);
    if (right.length > 0) {
      totalSeekTime = head - left[left.length - 1] + right[right.length - 1] - left[left.length - 1];
    } else {
      totalSeekTime = head - left[left.length - 1];
    }
  }
  
  return { sequence, totalSeekTime };
}

export function scheduleCLOOK(requests: number[], head: number, direction: 'left' | 'right'): DiskSchedulingResult {
  const sequence: number[] = [];
  const sorted = [...requests].sort((a, b) => a - b);
  const right = sorted.filter(r => r >= head);
  const left = sorted.filter(r => r < head);
  let totalSeekTime = 0;
  
  if (direction === 'right') {
    sequence.push(...right, ...left);
    if (left.length > 0) {
      totalSeekTime = right[right.length - 1] - head + right[right.length - 1] - left[0] + left[left.length - 1] - left[0];
    } else {
      totalSeekTime = right[right.length - 1] - head;
    }
  }
  
  return { sequence, totalSeekTime };
}