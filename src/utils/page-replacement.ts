export interface PageReplacementResult {
  history: Array<{
    frames: (number | null)[];
    currentPage: number;
    index: number;
    pageFault: boolean;
    replacedFrame?: number;
  }>;
  pageFaults: number;
}

export function simulateFIFO(pages: number[], frameSize: number): PageReplacementResult {
  const frames: (number | null)[] = new Array(frameSize).fill(null);
  const history = [];
  let pageFaults = 0;
  let oldestIndex = 0;
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const frameIndex = frames.indexOf(page);
    
    if (frameIndex === -1) {
      pageFaults++;
      const emptyIndex = frames.indexOf(null);
      
      if (emptyIndex !== -1) {
        frames[emptyIndex] = page;
      } else {
        frames[oldestIndex] = page;
        oldestIndex = (oldestIndex + 1) % frameSize;
      }
      
      history.push({
        frames: [...frames],
        currentPage: page,
        index: i,
        pageFault: true,
        replacedFrame: emptyIndex !== -1 ? emptyIndex : oldestIndex
      });
    } else {
      history.push({
        frames: [...frames],
        currentPage: page,
        index: i,
        pageFault: false
      });
    }
  }
  
  return { history, pageFaults };
}

export function simulateLRU(pages: number[], frameSize: number): PageReplacementResult {
  const frames: (number | null)[] = new Array(frameSize).fill(null);
  const history = [];
  const lastUsed = new Map<number, number>();
  let pageFaults = 0;
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const frameIndex = frames.indexOf(page);
    
    if (frameIndex === -1) {
      pageFaults++;
      const emptyIndex = frames.indexOf(null);
      
      if (emptyIndex !== -1) {
        frames[emptyIndex] = page;
      } else {
        let lruPage = -1;
        let minTime = Infinity;
        
        for (const p of frames) {
          if (p !== null && lastUsed.get(p)! < minTime) {
            minTime = lastUsed.get(p)!;
            lruPage = p;
          }
        }
        
        const replaceIndex = frames.indexOf(lruPage);
        frames[replaceIndex] = page;
      }
    }
    
    lastUsed.set(page, i);
    
    history.push({
      frames: [...frames],
      currentPage: page,
      index: i,
      pageFault: frameIndex === -1
    });
  }
  
  return { history, pageFaults };
}

export function simulateOptimal(pages: number[], frameSize: number): PageReplacementResult {
  const frames: (number | null)[] = new Array(frameSize).fill(null);
  const history = [];
  let pageFaults = 0;
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const frameIndex = frames.indexOf(page);
    
    if (frameIndex === -1) {
      pageFaults++;
      const emptyIndex = frames.indexOf(null);
      
      if (emptyIndex !== -1) {
        frames[emptyIndex] = page;
      } else {
        let replaceIndex = 0;
        let farthest = i;
        
        for (let j = 0; j < frameSize; j++) {
          let nextUse = pages.length;
          for (let k = i + 1; k < pages.length; k++) {
            if (pages[k] === frames[j]) {
              nextUse = k;
              break;
            }
          }
          
          if (nextUse > farthest) {
            farthest = nextUse;
            replaceIndex = j;
          }
        }
        
        frames[replaceIndex] = page;
      }
    }
    
    history.push({
      frames: [...frames],
      currentPage: page,
      index: i,
      pageFault: frameIndex === -1
    });
  }
  
  return { history, pageFaults };
}