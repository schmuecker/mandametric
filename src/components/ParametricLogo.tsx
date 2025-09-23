import React, { useRef, useMemo } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface Point {
  x: number;
  y: number;
}

interface CurveData {
  points: Point[];
  type: 'petal' | 'inner';
  layer: number;
  petal: number;
}

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
  animationDuration: number;
  backgroundColor: string;
  lineColor: string;
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
  animationDuration,
  backgroundColor,
  lineColor,
}) => {
  const oldCurvesRef = useRef<CurveData[] | null>(null);
  const interpolatorsRef = useRef<((t: number) => CurveData)[] | null>(null);

  // Smooth point interpolation
  const interpolatePoint = (p1: Point, p2: Point, t: number): Point => ({
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  });

  // Smooth curve interpolation with consistent point counts
  const interpolateCurve = (curve1: CurveData, curve2: CurveData) => {
    return (t: number): CurveData => {
      const points: Point[] = [];
      const maxPoints = Math.max(curve1.points.length, curve2.points.length);
      
      // Normalize both curves to same point count
      for (let i = 0; i < maxPoints; i++) {
        const ratio1 = (i / (maxPoints - 1)) * (curve1.points.length - 1);
        const ratio2 = (i / (maxPoints - 1)) * (curve2.points.length - 1);
        
        const idx1 = Math.floor(ratio1);
        const idx2 = Math.floor(ratio2);
        
        const p1 = curve1.points[Math.min(idx1, curve1.points.length - 1)];
        const p2 = curve2.points[Math.min(idx2, curve2.points.length - 1)];
        
        points.push(interpolatePoint(p1, p2, t));
      }
      
      return {
        ...curve2,
        points,
      };
    };
  };

  // Convert curve data to perfect bezier SVG paths
  const curveToPath = (curve: CurveData): string => {
    if (curve.points.length === 0) return '';
    
    const points = curve.points;
    
    // Handle straight lines
    if (points.length === 2) {
      return `M ${points[0].x.toFixed(3)} ${points[0].y.toFixed(3)} L ${points[1].x.toFixed(3)} ${points[1].y.toFixed(3)}`;
    }
    
    if (points.length === 1) {
      return `M ${points[0].x.toFixed(3)} ${points[0].y.toFixed(3)}`;
    }
    
    // Use sophisticated bezier curve generation for perfect smoothness
    let pathData = `M ${points[0].x.toFixed(3)} ${points[0].y.toFixed(3)}`;
    
    if (points.length === 3) {
      // Quadratic bezier for 3 points
      const cp = points[1];
      const end = points[2];
      pathData += ` Q ${cp.x.toFixed(3)} ${cp.y.toFixed(3)}, ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
      return pathData;
    }
    
    // For longer curves, use optimized cubic bezier with perfect tangent continuity
    const tension = 0.25; // Reduced tension for cleaner curves
    
    for (let i = 1; i < points.length; i++) {
      const p0 = points[Math.max(0, i - 2)];
      const p1 = points[i - 1];
      const p2 = points[i];
      const p3 = points[Math.min(points.length - 1, i + 1)];
      
      // Enhanced control point calculation for smoother bezier curves
      let cp1x, cp1y, cp2x, cp2y;
      
      if (i === 1) {
        // First segment - smooth start
        cp1x = p1.x + (p2.x - p1.x) * tension;
        cp1y = p1.y + (p2.y - p1.y) * tension;
        cp2x = p2.x - (p3.x - p1.x) * tension * 0.5;
        cp2y = p2.y - (p3.y - p1.y) * tension * 0.5;
      } else if (i === points.length - 1) {
        // Last segment - smooth end
        cp1x = p1.x + (p2.x - p0.x) * tension * 0.5;
        cp1y = p1.y + (p2.y - p0.y) * tension * 0.5;
        cp2x = p2.x - (p2.x - p1.x) * tension;
        cp2y = p2.y - (p2.y - p1.y) * tension;
      } else {
        // Middle segments - perfect continuity
        const t1x = (p2.x - p0.x) * tension;
        const t1y = (p2.y - p0.y) * tension;
        const t2x = (p3.x - p1.x) * tension;
        const t2y = (p3.y - p1.y) * tension;
        
        cp1x = p1.x + t1x;
        cp1y = p1.y + t1y;
        cp2x = p2.x - t2x;
        cp2y = p2.y - t2y;
      }
      
      pathData += ` C ${cp1x.toFixed(3)} ${cp1y.toFixed(3)}, ${cp2x.toFixed(3)} ${cp2y.toFixed(3)}, ${p2.x.toFixed(3)} ${p2.y.toFixed(3)}`;
    }
    
    return pathData;
  };

  // Generate sophisticated clean geometry with perfect bezier curves
  const generateCurves = () => {
    const curves: CurveData[] = [];
    const center = size / 2;
    const POINTS_PER_CURVE = 32; // Higher precision for smoother curves

    // Generate main petal arcs using perfect circular segments
    for (let petal = 0; petal < numPetals; petal++) {
      const petalAngle = (petal * 2 * Math.PI) / numPetals;
      
      for (let layer = 0; layer < numLayers; layer++) {
        const layerAngle = petalAngle + layer * staggeredRotation;
        const baseRadius = (size * 0.12) + (layer / (numLayers - 1)) * (size * 0.32);
        
        // Create perfect petal arc using parametric circle equations
        const points: Point[] = [];
        const arcSpan = angleRange * (0.8 + 0.2 * Math.sin(layer * Math.PI / numLayers));
        
        for (let i = 0; i < POINTS_PER_CURVE; i++) {
          const t = i / (POINTS_PER_CURVE - 1);
          const angle = layerAngle + (t - 0.5) * arcSpan;
          
          // Perfect circular arc with subtle waviness
          const radiusVariation = 1 + waviness * 0.15 * Math.sin(3 * Math.PI * t);
          const r = baseRadius * radiusVariation;
          
          points.push({
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
          });
        }

        curves.push({
          points,
          type: 'petal',
          layer,
          petal,
        });
      }
    }

    // Generate concentric circle segments with perfect geometry
    const concentricRings = Math.min(numLayers, 6); // Limit for cleaner appearance
    for (let ring = 0; ring < concentricRings; ring++) {
      const minRadius = size * innerRadiusMin * 0.5;
      const maxRadius = size * innerRadiusMax * 0.5;
      const ringRadius = minRadius + (ring / concentricRings) * (maxRadius - minRadius);
      const segmentsPerRing = Math.max(numPetals * 2, 8);
      
      for (let segment = 0; segment < segmentsPerRing; segment++) {
        const segmentAngle = (segment * 2 * Math.PI) / segmentsPerRing + ring * staggeredRotation;
        const arcLength = (2 * Math.PI) / segmentsPerRing * 0.7; // Gap between segments
        
        const points: Point[] = [];
        const segmentPoints = Math.floor(POINTS_PER_CURVE * 0.6);
        
        for (let i = 0; i < segmentPoints; i++) {
          const t = i / (segmentPoints - 1);
          const angle = segmentAngle + (t - 0.5) * arcLength;
          
          // Perfect circle with controlled variation
          const radiusModulation = 1 + innerAmplitude * 0.3 * Math.cos(numPetals * angle + waviness);
          const r = ringRadius * radiusModulation;
          
          points.push({
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
          });
        }
        
        curves.push({
          points,
          type: 'inner',
          layer: ring,
          petal: segment,
        });
      }
    }

    // Add connecting bridge curves between layers
    if (numLayers > 2) {
      for (let petal = 0; petal < numPetals; petal++) {
        const petalAngle = (petal * 2 * Math.PI) / numPetals;
        
        for (let layer = 0; layer < numLayers - 1; layer++) {
          const minR = size * innerRadiusMin * 0.5;
          const maxR = size * innerRadiusMax * 0.5;
          const innerRadius = minR + (layer / (numLayers - 1)) * (maxR - minR);
          const outerRadius = minR + ((layer + 1) / (numLayers - 1)) * (maxR - minR);
          
          // Create elegant connecting curves
          const points: Point[] = [];
          const bridgePoints = Math.floor(POINTS_PER_CURVE * 0.4);
          
          for (let i = 0; i < bridgePoints; i++) {
            const t = i / (bridgePoints - 1);
            const angle = petalAngle + layer * staggeredRotation + (t - 0.5) * angleRange * 0.3;
            
            // Smooth transition between radii
            const r = innerRadius + (outerRadius - innerRadius) * t;
            const radiusModulation = 1 + innerAmplitude * 0.2 * Math.sin(2 * Math.PI * t + waviness);
            
            points.push({
              x: center + r * radiusModulation * Math.cos(angle),
              y: center + r * radiusModulation * Math.sin(angle),
            });
          }
          
          if (layer % 2 === 0) { // Only add every other bridge to avoid clutter
            curves.push({
              points,
              type: 'inner',
              layer,
              petal,
            });
          }
        }
      }
    }

    return curves;
  };

  const curves = useMemo(() => generateCurves(), [waviness, staggeredRotation, numPetals, numLayers, innerRadiusMin, innerRadiusMax, angleRange, innerAmplitude, strokeWidth, opacityBase, opacityVariation, lineRotationSpread, size]);

  const [springs, api] = useSpring(() => ({
    t: 1,
    config: { 
      duration: animationDuration,
      easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, // ease-in-out cubic
    }
  }));



  // Trigger smooth animation when curves change
  React.useEffect(() => {
    if (oldCurvesRef.current && oldCurvesRef.current.length === curves.length) {
      // Create custom interpolators
      interpolatorsRef.current = curves.map((newCurve, i) =>
        interpolateCurve(oldCurvesRef.current![i], newCurve)
      );
      // Smooth animation with current duration
      api.start({ 
        from: { t: 0 },
        to: { t: 1 },
        config: { 
          duration: animationDuration,
          easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        }
      });
    } else {
      // First render or curve count changed
      interpolatorsRef.current = null;
      api.set({ t: 1 });
    }
    oldCurvesRef.current = [...curves];
  }, [curves, api, animationDuration]);

  const getCurrentPath = (index: number): string => {
    if (interpolatorsRef.current && interpolatorsRef.current[index] && springs.t.get() < 0.99) {
      const interpolatedCurve = interpolatorsRef.current[index](springs.t.get());
      return curveToPath(interpolatedCurve);
    }
    return curveToPath(curves[index]);
  };

  return (
    <div className={`inline-block ${className}`}>
      <animated.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        style={{ 
          backgroundColor: backgroundColor,
          transform: `scale(3)`,
          willChange: 'transform' // Optimize for GPU acceleration
        }}
      >
        {curves.map((curve, index) => {
          // Calculate stroke width based on curve type and layer
          const baseWidth = curve.type === 'petal' ? strokeWidth : strokeWidth * 0.7;
          const layerWidth = baseWidth * (0.5 + (curve.layer / (numLayers || 1)) * 0.5);
          
          // Calculate opacity with better distribution
          const layerOpacity = opacityBase + (curve.layer * 0.1) + ((curve.petal % 2) * opacityVariation);
          const finalOpacity = Math.min(1, Math.max(0.1, layerOpacity));
          
          return (
            <animated.path
              key={`${curve.type}-${curve.petal}-${curve.layer}-${index}`}
              d={springs.t.to(() => getCurrentPath(index))}
              fill="none"
              stroke={lineColor}
              strokeWidth={layerWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={finalOpacity}
              transform={`rotate(${(index / curves.length) * lineRotationSpread} ${size/2} ${size/2})`}
              style={{
                vectorEffect: 'non-scaling-stroke',
                willChange: 'd'
              }}
            />
          );
        })}
      </animated.svg>
    </div>
  );
};