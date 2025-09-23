import React from 'react';

interface CleanSVGLogoProps {
  size?: number;
  className?: string;
}

export const CleanSVGLogo: React.FC<CleanSVGLogoProps> = ({ 
  size = 400, 
  className = "" 
}) => {
  // Generate clean SVG paths for the 3-petal pattern
  const generateCleanSVG = () => {
    const center = size / 2;
    const numPetals = 3;
    const paths: string[] = [];
    
    // Generate main petal shapes
    for (let petal = 0; petal < numPetals; petal++) {
      const baseAngle = (petal * 2 * Math.PI) / numPetals;
      
      // Create simplified petal shape
      const petalRadius = size * 0.3;
      const points: { x: number; y: number }[] = [];
      
      // Generate petal curve points
      for (let t = 0; t <= 1; t += 0.1) {
        const angle = baseAngle + (t - 0.5) * (Math.PI / 3);
        const r = petalRadius * Math.sin(Math.PI * t);
        
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        
        points.push({ x, y });
      }
      
      // Create smooth path
      if (points.length > 0) {
        let pathData = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
        
        for (let i = 1; i < points.length - 1; i += 2) {
          const cp1 = points[i];
          const cp2 = points[i + 1] || points[i];
          const end = points[i + 2] || points[points.length - 1];
          
          pathData += ` C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)}, ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)}, ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
        }
        
        paths.push(pathData);
      }
    }
    
    // Add center connecting lines
    for (let i = 0; i < 3; i++) {
      const angle1 = (i * 2 * Math.PI) / 3;
      const angle2 = ((i + 1) * 2 * Math.PI) / 3;
      
      const innerRadius = size * 0.1;
      const x1 = center + innerRadius * Math.cos(angle1);
      const y1 = center + innerRadius * Math.sin(angle1);
      const x2 = center + innerRadius * Math.cos(angle2);
      const y2 = center + innerRadius * Math.sin(angle2);
      
      paths.push(`M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`);
    }
    
    return paths;
  };

  const paths = generateCleanSVG();
  
  // Generate the complete SVG string for export
  const generateSVGString = () => {
    const svgPaths = paths.map(path => 
      `<path d="${path}" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
    ).join('\n  ');
    
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${svgPaths}
</svg>`;
  };

  // Store the SVG string for export
  React.useEffect(() => {
    const svgString = generateSVGString();
    (window as any).cleanSVGString = svgString;
  }, [size]);

  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        style={{ background: 'hsl(var(--logo-bg))' }}
      >
        {paths.map((path, index) => (
          <path
            key={index}
            d={path}
            fill="none"
            stroke="hsl(var(--logo-stroke))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
};