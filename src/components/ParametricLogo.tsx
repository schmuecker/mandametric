import React from 'react';

interface ParametricLogoProps {
  size?: number;
  className?: string;
}

export const ParametricLogo: React.FC<ParametricLogoProps> = ({ 
  size = 400, 
  className = "" 
}) => {
  const center = size / 2;
  const scale = size / 400;

  // Generate the three symmetric heart shapes with flowing lines
  const generateSymmetricLogo = () => {
    const lines: string[] = [];
    
    // Three heart positions with perfect 120° symmetry
    const heartAngles = [0, 2 * Math.PI / 3, 4 * Math.PI / 3]; // 0°, 120°, 240°
    const heartDistance = 100 * scale; // Distance from center to each heart
    
    // Generate flowing lines that create the heart shapes
    for (let lineIndex = 0; lineIndex < 30; lineIndex++) {
      const t = lineIndex / 29; // 0 to 1
      
      // Create a line that flows through all three hearts
      for (let heartIdx = 0; heartIdx < 3; heartIdx++) {
        const heartAngle = heartAngles[heartIdx];
        const heartCenterX = center + heartDistance * Math.cos(heartAngle);
        const heartCenterY = center + heartDistance * Math.sin(heartAngle);
        
        // Generate heart-shaped curve for this heart
        const heartPath = generateHeartCurve(heartCenterX, heartCenterY, 40 * scale, t, heartAngle);
        if (heartPath) {
          lines.push(heartPath);
        }
      }
    }
    
    // Generate connecting lines that form the central triangle
    for (let connectionIndex = 0; connectionIndex < 15; connectionIndex++) {
      const t = connectionIndex / 14;
      
      for (let side = 0; side < 3; side++) {
        const angle1 = heartAngles[side];
        const angle2 = heartAngles[(side + 1) % 3];
        
        const radius = (20 + t * 60) * scale;
        
        const x1 = center + radius * Math.cos(angle1);
        const y1 = center + radius * Math.sin(angle1);
        const x2 = center + radius * Math.cos(angle2);
        const y2 = center + radius * Math.sin(angle2);
        
        // Create curved connection
        const midAngle = (angle1 + angle2) / 2;
        const controlRadius = radius * 1.3;
        const cpX = center + controlRadius * Math.cos(midAngle);
        const cpY = center + controlRadius * Math.sin(midAngle);
        
        lines.push(`M ${x1} ${y1} Q ${cpX} ${cpY} ${x2} ${y2}`);
      }
    }
    
    return lines;
  };
  
  // Generate a single heart-shaped curve
  const generateHeartCurve = (
    centerX: number, 
    centerY: number, 
    size: number, 
    layer: number,
    rotation: number
  ): string => {
    const points: { x: number; y: number }[] = [];
    const heartSize = size * (0.3 + layer * 0.7);
    
    // Heart parametric equations
    for (let t = 0; t <= 2 * Math.PI; t += Math.PI / 30) {
      // Classic heart shape equations
      const heartX = heartSize * (16 * Math.pow(Math.sin(t), 3));
      const heartY = heartSize * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      
      // Scale down and apply rotation
      const scaledX = heartX * 0.03;
      const scaledY = -heartY * 0.03; // Flip Y to point upward
      
      // Apply rotation
      const rotatedX = scaledX * Math.cos(rotation) - scaledY * Math.sin(rotation);
      const rotatedY = scaledX * Math.sin(rotation) + scaledY * Math.cos(rotation);
      
      points.push({
        x: centerX + rotatedX,
        y: centerY + rotatedY
      });
    }
    
    if (points.length < 2) return '';
    
    // Create smooth heart path
    let pathData = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      pathData += ` L ${current.x} ${current.y}`;
    }
    
    pathData += ' Z'; // Close the heart shape
    
    return pathData;
  };

  const allLines = generateSymmetricLogo();

  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        style={{ background: 'hsl(var(--logo-bg))' }}
      >
        {allLines.map((line, index) => (
          <path
            key={index}
            d={line}
            fill="none"
            stroke="hsl(var(--logo-stroke))"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        ))}
      </svg>
    </div>
  );
};