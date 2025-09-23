import React from 'react';

interface ParametricLogoProps {
  size?: number;
  className?: string;
  waviness: number;
  staggeredRotation: number;
  numPetals: number;
  numLayers: number;
  innerRadiusMin: number;
  innerRadiusMax: number;
  angleRange: number;
  innerAmplitude: number;
  strokeWidth: number;
  opacityBase: number;
  opacityVariation: number;
  lineRotationSpread: number;
}

export const ParametricLogo: React.FC<ParametricLogoProps> = ({
  size = 400,
  className = "",
  waviness,
  staggeredRotation,
  numPetals,
  numLayers,
  innerRadiusMin,
  innerRadiusMax,
  angleRange,
  innerAmplitude,
  strokeWidth,
  opacityBase,
  opacityVariation,
  lineRotationSpread,
}) => {
  // Generate curves for the parametric petal pattern
  const generateCurves = () => {
    const curves: string[] = [];
    const center = size / 2;

    
    for (let petal = 0; petal < numPetals; petal++) {
      for (let layer = 0; layer < numLayers; layer++) {
        const baseAngle = (petal * 2 * Math.PI) / numPetals + layer * staggeredRotation;
        const radiusScale = 0.3 + (layer / numLayers) * 0.6;
        const maxRadius = (size * 0.35) * radiusScale;
        
        // Generate the petal curve using parametric equations
        let pathData = '';
        const points: { x: number; y: number }[] = [];
        
        // Create the curved petal shape
        for (let t = 0; t <= 1; t += 0.02) {
          // Use a combination of sinusoidal functions to create the petal shape
          const angle = baseAngle + (t - 0.5) * angleRange;

          // Create the characteristic curved shape
          const r = maxRadius * Math.sin(Math.PI * t) * (1 + 0.3 * waviness * Math.cos(numPetals * Math.PI * t));
          
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          
          points.push({ x, y });
        }
        
        // Create smooth path using bezier curves
        if (points.length > 0) {
          pathData = `M ${points[0].x} ${points[0].y}`;
          
          for (let i = 1; i < points.length; i++) {
            if (i === 1) {
              pathData += ` Q ${points[i].x} ${points[i].y}`;
            } else {
              // Calculate control points for smooth curves
              const prevPoint = points[i - 1];
              const currentPoint = points[i];
              
              if (i < points.length - 1) {
                const nextPoint = points[i + 1];
              const cp1x = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.3;
              const cp1y = prevPoint.y + (currentPoint.y - prevPoint.y) * 0.3;
              const cp2x = currentPoint.x - (nextPoint.x - currentPoint.x) * 0.3;
              const cp2y = currentPoint.y - (nextPoint.y - currentPoint.y) * 0.3;
                
                pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentPoint.x} ${currentPoint.y}`;
              } else {
                pathData += ` L ${currentPoint.x} ${currentPoint.y}`;
              }
            }
          }
        }
        
        if (pathData) {
          curves.push(pathData);
        }
      }
    }
    
    // Generate the inner connecting curves
    for (let petal = 0; petal < numPetals; petal++) {
      const petalAngle = (petal * 2 * Math.PI) / numPetals;
      for (let layer = 1; layer < numLayers - 1; layer++) {
        const radiusScale = innerRadiusMin + (layer / numLayers) * (innerRadiusMax - innerRadiusMin);
        const radius = (size * 0.15) * radiusScale;

        for (let i = 0; i < 60; i++) {
          const angle = petalAngle + (i / 60) * 2 * Math.PI + layer * staggeredRotation;
          const nextAngle = petalAngle + ((i + 1) / 60) * 2 * Math.PI + layer * staggeredRotation;
        
        // Create inner spiral patterns
        const r1 = radius * (1 + innerAmplitude * waviness * Math.sin(numPetals * angle + layer));
        const r2 = radius * (1 + innerAmplitude * waviness * Math.sin(numPetals * nextAngle + layer));
        
        const x1 = center + r1 * Math.cos(angle);
        const y1 = center + r1 * Math.sin(angle);
        const x2 = center + r2 * Math.cos(nextAngle);
        const y2 = center + r2 * Math.sin(nextAngle);
        
        const pathData = `M ${x1} ${y1} Q ${center + (r1 + r2) * 0.6 * Math.cos((angle + nextAngle) / 2)} ${center + (r1 + r2) * 0.6 * Math.sin((angle + nextAngle) / 2)} ${x2} ${y2}`;
        curves.push(pathData);
      }
    }
    }
    
    return curves;
  };

  const curves = generateCurves();

  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        style={{ background: 'hsl(var(--logo-bg))', transform: `scale(3)` }}
      >
        {curves.map((curve, index) => (
          <path
            key={index}
            d={curve}
            fill="none"
            stroke="hsl(var(--logo-stroke))"
            strokeWidth={index < curves.length - 300 ? strokeWidth : strokeWidth * 0.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={opacityBase + (index % 3) * opacityVariation}
            transform={`translate(${size/2} ${size/2}) rotate(${(index / curves.length) * lineRotationSpread}) translate(${-size/2} ${-size/2})`}
          />
        ))}
      </svg>
    </div>
  );
};