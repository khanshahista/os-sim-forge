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

interface AllocationStep {
  blocks: MemoryBlock[];
  processes: Process[];
}

export interface AllocationResult {
  steps: AllocationStep[];
  blocks: MemoryBlock[];
  processes: Process[];
}

export function allocateFirstFit(blocks: MemoryBlock[], processes: Process[]): AllocationResult {
  const steps: AllocationStep[] = [];
  
  for (const process of processes) {
    for (const block of blocks) {
      if (!block.allocated && block.size >= process.size) {
        block.allocated = true;
        block.processId = process.id;
        block.processSize = process.size;
        process.allocated = true;
        process.blockId = block.id;
        break;
      }
    }
    
    steps.push({
      blocks: blocks.map(b => ({ ...b })),
      processes: processes.map(p => ({ ...p }))
    });
  }
  
  return { steps, blocks, processes };
}

export function allocateBestFit(blocks: MemoryBlock[], processes: Process[]): AllocationResult {
  const steps: AllocationStep[] = [];
  
  for (const process of processes) {
    let bestBlock: MemoryBlock | null = null;
    let minWaste = Infinity;
    
    for (const block of blocks) {
      if (!block.allocated && block.size >= process.size) {
        const waste = block.size - process.size;
        if (waste < minWaste) {
          minWaste = waste;
          bestBlock = block;
        }
      }
    }
    
    if (bestBlock) {
      bestBlock.allocated = true;
      bestBlock.processId = process.id;
      bestBlock.processSize = process.size;
      process.allocated = true;
      process.blockId = bestBlock.id;
    }
    
    steps.push({
      blocks: blocks.map(b => ({ ...b })),
      processes: processes.map(p => ({ ...p }))
    });
  }
  
  return { steps, blocks, processes };
}