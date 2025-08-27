import { motion } from 'framer-motion';

interface GanttSegment {
  process: string;
  startTime: number;
  endTime: number;
}

interface GanttChartProps {
  data: GanttSegment[];
}

const colors = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-green-500 to-green-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-teal-500 to-teal-600',
  'from-red-500 to-red-600',
  'from-indigo-500 to-indigo-600',
];

const GanttChart = ({ data }: GanttChartProps) => {
  if (!data || data.length === 0) return null;

  const totalTime = data[data.length - 1].endTime;
  const processColors = new Map();
  let colorIndex = 0;

  // Assign colors to processes
  data.forEach(segment => {
    if (!processColors.has(segment.process)) {
      processColors.set(segment.process, colors[colorIndex % colors.length]);
      colorIndex++;
    }
  });

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="relative">
        <div className="flex w-full rounded-lg overflow-hidden bg-muted/20">
          {data.map((segment, index) => {
            const width = ((segment.endTime - segment.startTime) / totalTime) * 100;
            const color = processColors.get(segment.process);
            
            return (
              <motion.div
                key={index}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                className={`relative bg-gradient-to-r ${color} h-16 border-r border-background/20`}
                style={{ width: `${width}%`, transformOrigin: 'left' }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                  {segment.process}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Timeline */}
        <div className="flex w-full mt-2 text-xs text-muted-foreground">
          {data.map((segment, index) => {
            const width = ((segment.endTime - segment.startTime) / totalTime) * 100;
            
            return (
              <div key={index} className="flex-none" style={{ width: `${width}%` }}>
                <span>{segment.startTime}</span>
                {index === data.length - 1 && (
                  <span className="float-right">{segment.endTime}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-4">
        {Array.from(processColors.entries()).map(([process, color]) => (
          <div key={process} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded bg-gradient-to-r ${color}`} />
            <span className="text-sm text-muted-foreground">{process}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttChart;