import React from 'react';

interface ParametricLogoProps {
  size?: number;
  className?: string;
}

export const ParametricLogo: React.FC<ParametricLogoProps> = ({ 
  size = 400, 
  className = "" 
}) => {
  // Generate the three heart-shaped forms with connecting lines
  const generateHeartFlowLines = () => {
    const lines: string[] = [];
    const center = size / 2;
    const heartRadius = size * 0.3;
    
    // Three heart centers forming a triangle
    const heartCenters = [
      { x: center, y: center - heartRadius * 0.6 }, // Top heart
      { x: center - heartRadius * 0.52, y: center + heartRadius * 0.3 }, // Bottom left heart
      { x: center + heartRadius * 0.52, y: center + heartRadius * 0.3 }  // Bottom right heart
    ];
    
    // Generate flowing lines that connect through all three hearts
    for (let lineIndex = 0; lineIndex < 50; lineIndex++) {
      const t = lineIndex / 49; // Normalized parameter 0 to 1
      const pathData = generateFlowingLine(heartCenters, center, heartRadius, t);
      if (pathData) {
        lines.push(pathData);
      }
    }
    
    return lines;
  };
  
  // Generate a single flowing line that passes through all three hearts
  const generateFlowingLine = (
    heartCenters: { x: number; y: number }[], 
    center: number, 
    heartRadius: number, 
    t: number
  ): string => {
    const points: { x: number; y: number }[] = [];
    
    // Parameters for the flowing line
    const baseRadius = heartRadius * (0.4 + t * 0.5);
    const angleOffset = t * Math.PI * 2;
    
    // Generate points that flow through all three heart shapes
    for (let i = 0; i <= 150; i++) {
      const angle = (i / 150) * Math.PI * 6 + angleOffset; // Multiple rotations
      
      // Determine which heart region we're in
      const regionAngle = (angle % (Math.PI * 2)) / (Math.PI * 2) * 3;
      const heartIndex = Math.floor(regionAngle);
      const localT = regionAngle - heartIndex;
      
      // Get the current heart center
      const currentHeart = heartCenters[heartIndex % 3];
      const nextHeart = heartCenters[(heartIndex + 1) % 3];
      
      // Create heart-shaped curve within each region
      const heartPhase = localT * Math.PI * 2;
      
      // Heart curve equation modified for flowing effect
      const heartX = baseRadius * (1 + 0.3 * Math.cos(heartPhase)) * Math.cos(heartPhase * 0.5);
      const heartY = baseRadius * (1 + 0.3 * Math.cos(heartPhase)) * Math.sin(heartPhase * 0.5) * 0.8;
      
      // Apply heart shape deformation
      const heartDeform = Math.pow(Math.sin(heartPhase * 0.5), 2);
      const finalX = currentHeart.x + heartX * (1 - heartDeform * 0.3);
      const finalY = currentHeart.y + heartY * (1 + heartDeform * 0.2);
      
      // Add connecting flow between hearts
      if (localT > 0.8) {
        const connectionT = (localT - 0.8) / 0.2;
        const connectedX = finalX + (nextHeart.x - currentHeart.x) * connectionT * 0.3;
        const connectedY = finalY + (nextHeart.y - currentHeart.y) * connectionT * 0.3;
        points.push({ x: connectedX, y: connectedY });
      } else {
        points.push({ x: finalX, y: finalY });
      }
    }
    
    // Create smooth path
    if (points.length < 2) return '';
    
    let pathData = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Create smooth curves using quadratic bezier
      const cpX = current.x + (next.x - current.x) * 0.5;
      const cpY = current.y + (next.y - current.y) * 0.5;
      
      pathData += ` Q ${current.x} ${current.y} ${cpX} ${cpY}`;
    }
    
    // Close the path to complete the flow
    pathData += ` Q ${points[points.length - 1].x} ${points[points.length - 1].y} ${points[0].x} ${points[0].y}`;
    
    return pathData;
  };
  
  // Generate additional inner triangle connecting lines
  const generateTriangleConnections = () => {
    const lines: string[] = [];
    const center = size / 2;
    const innerRadius = size * 0.08;
    
    // Create the central triangle pattern
    for (let layer = 0; layer < 8; layer++) {
      const radius = innerRadius + layer * (innerRadius * 0.3);
      
      for (let side = 0; side < 3; side++) {
        const angle1 = (side * Math.PI * 2) / 3;
        const angle2 = ((side + 1) * Math.PI * 2) / 3;
        
        const x1 = center + radius * Math.cos(angle1);
        const y1 = center + radius * Math.sin(angle1);
        const x2 = center + radius * Math.cos(angle2);
        const y2 = center + radius * Math.sin(angle2);
        
        // Create connecting arcs between triangle points
        const midAngle = (angle1 + angle2) / 2;
        const controlRadius = radius * 1.2;
        const cpX = center + controlRadius * Math.cos(midAngle);
        const cpY = center + controlRadius * Math.sin(midAngle);
        
        const pathData = `M ${x1} ${y1} Q ${cpX} ${cpY} ${x2} ${y2}`;
        lines.push(pathData);
      }
    }
    
    return lines;
  };

  const flowLines = generateHeartFlowLines();
  const triangleLines = generateTriangleConnections();
  const allLines = [...flowLines, ...triangleLines];

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
            strokeWidth={index < flowLines.length ? 1.5 : 1}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7 + (index % 4) * 0.075}
          />
        ))}
      </svg>
    </div>
  );
};