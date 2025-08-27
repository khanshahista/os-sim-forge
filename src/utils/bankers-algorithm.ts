export interface BankersData {
  processes: number;
  resources: number;
  available: number[];
  maximum: number[][];
  allocation: number[][];
  need: number[][];
}

export interface SafetyResult {
  isSafe: boolean;
  safeSequence: string[];
  steps: any[];
}

export function checkSafety(data: BankersData): SafetyResult {
  const { processes, resources, available, allocation, need } = data;
  const work = [...available];
  const finish = new Array(processes).fill(false);
  const safeSequence: string[] = [];
  const steps: any[] = [];
  
  let count = 0;
  
  while (count < processes) {
    let found = false;
    
    for (let p = 0; p < processes; p++) {
      if (!finish[p]) {
        let canAllocate = true;
        
        for (let j = 0; j < resources; j++) {
          if (need[p][j] > work[j]) {
            canAllocate = false;
            break;
          }
        }
        
        if (canAllocate) {
          for (let k = 0; k < resources; k++) {
            work[k] += allocation[p][k];
          }
          
          safeSequence.push(`P${p}`);
          finish[p] = true;
          found = true;
          count++;
          
          steps.push({
            process: p,
            work: [...work],
            safeSequence: [...safeSequence]
          });
        }
      }
    }
    
    if (!found) {
      return { isSafe: false, safeSequence: [], steps };
    }
  }
  
  return { isSafe: true, safeSequence, steps };
}