import { motion } from 'framer-motion';

interface DiskVisualizationProps {
  diskSize: number;
  requests: number[];
  currentPosition: number;
  seekSequence: number[];
}

const DiskVisualization = ({ diskSize, requests, currentPosition, seekSequence }: DiskVisualizationProps) => {
  const position = (currentPosition / diskSize) * 100;

  return (
    <div className="space-y-6">
      {/* Disk Track */}
      <div className="relative h-20 bg-muted/20 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center">
          {/* Track lines */}
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="absolute h-full w-px bg-border/30"
              style={{ left: `${(i + 1) * 10}%` }}
            />
          ))}
          
          {/* Request positions */}
          {requests.map((req, index) => (
            <motion.div
              key={index}
              className="absolute w-1 h-full bg-warning/50"
              style={{ left: `${(req / diskSize) * 100}%` }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
          
          {/* Disk head */}
          <motion.div
            className="absolute w-2 h-full bg-gradient-to-b from-primary to-primary/50 shadow-glow"
            style={{ left: `${position}%` }}
            animate={{ left: `${position}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono">
                {currentPosition}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scale */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>{Math.floor(diskSize * 0.25)}</span>
        <span>{Math.floor(diskSize * 0.5)}</span>
        <span>{Math.floor(diskSize * 0.75)}</span>
        <span>{diskSize - 1}</span>
      </div>
    </div>
  );
};

export default DiskVisualization;