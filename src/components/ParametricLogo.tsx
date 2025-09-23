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

  // Convert curve data to SVG path with high precision
  const curveToPath = (curve: CurveData): string => {
    if (curve.points.length === 0) return '';
    
    const points = curve.points;
    let pathData = `M ${points[0].x.toFixed(3)} ${points[0].y.toFixed(3)}`;
    
    if (points.length === 2) {
      pathData += ` L ${points[1].x.toFixed(3)} ${points[1].y.toFixed(3)}`;
      return pathData;
    }
    
    // Use smooth cubic Bezier curves
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1] || curr;
      
      if (i === 1) {
        // First curve segment
        const cp1x = prev.x + (curr.x - prev.x) * 0.25;
        const cp1y = prev.y + (curr.y - prev.y) * 0.25;
        const cp2x = curr.x - (next.x - prev.x) * 0.125;
        const cp2y = curr.y - (next.y - prev.y) * 0.125;
        
        pathData += ` C ${cp1x.toFixed(3)} ${cp1y.toFixed(3)}, ${cp2x.toFixed(3)} ${cp2y.toFixed(3)}, ${curr.x.toFixed(3)} ${curr.y.toFixed(3)}`;
      } else if (i === points.length - 1) {
        // Last segment
        pathData += ` L ${curr.x.toFixed(3)} ${curr.y.toFixed(3)}`;
      } else {
        // Middle segments with smooth control points
        const prevPrev = points[i - 2];
        const cp1x = prev.x + (curr.x - prevPrev.x) * 0.125;
        const cp1y = prev.y + (curr.y - prevPrev.y) * 0.125;
        const cp2x = curr.x - (next.x - prev.x) * 0.125;
        const cp2y = curr.y - (next.y - prev.y) * 0.125;
        
        pathData += ` C ${cp1x.toFixed(3)} ${cp1y.toFixed(3)}, ${cp2x.toFixed(3)} ${cp2y.toFixed(3)}, ${curr.x.toFixed(3)} ${curr.y.toFixed(3)}`;
      }
    }
    
    return pathData;
  };

  // Generate curves with consistent point counts for smooth interpolation
  const generateCurves = () => {
    const curves: CurveData[] = [];
    const center = size / 2;
    const POINTS_PER_CURVE = 20; // Fixed point count for consistent interpolation

    // Generate petal curves
    for (let petal = 0; petal < numPetals; petal++) {
      for (let layer = 0; layer < numLayers; layer++) {
        const baseAngle = (petal * 2 * Math.PI) / numPetals + layer * staggeredRotation;
        const radiusScale = 0.3 + (layer / numLayers) * 0.6;
        const maxRadius = (size * 0.35) * radiusScale;
        
        const points: Point[] = [];
        
        // Generate exactly POINTS_PER_CURVE points
        for (let i = 0; i < POINTS_PER_CURVE; i++) {
          const t = i / (POINTS_PER_CURVE - 1);
          const angle = baseAngle + (t - 0.5) * angleRange;
          const r = maxRadius * Math.sin(Math.PI * t) * (1 + 0.3 * waviness * Math.cos(numPetals * Math.PI * t));
          
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

    // Generate inner connecting curves with consistent point count
    for (let petal = 0; petal < numPetals; petal++) {
      const petalAngle = (petal * 2 * Math.PI) / numPetals;
      for (let layer = 1; layer < numLayers - 1; layer++) {
        const radiusScale = innerRadiusMin + (layer / numLayers) * (innerRadiusMax - innerRadiusMin);
        const radius = (size * 0.15) * radiusScale;

        // Reduce inner curve complexity for better performance
        const innerCurveCount = Math.min(15, Math.max(5, Math.floor(30 * (radius / (size * 0.15)))));
        
        for (let i = 0; i < innerCurveCount; i++) {
          const t1 = i / innerCurveCount;
          const t2 = (i + 1) / innerCurveCount;
          
          const angle1 = petalAngle + t1 * 2 * Math.PI + layer * staggeredRotation;
          const angle2 = petalAngle + t2 * 2 * Math.PI + layer * staggeredRotation;

          const r1 = radius * (1 + innerAmplitude * waviness * Math.sin(numPetals * angle1 + layer));
          const r2 = radius * (1 + innerAmplitude * waviness * Math.sin(numPetals * angle2 + layer));

          // Create 2-point curves for inner connections
          const points: Point[] = [
            {
              x: center + r1 * Math.cos(angle1),
              y: center + r1 * Math.sin(angle1),
            },
            {
              x: center + r2 * Math.cos(angle2),
              y: center + r2 * Math.sin(angle2),
            }
          ];

          curves.push({
            points,
            type: 'inner',
            layer,
            petal,
          });
        }
      }
    }

    return curves;
  };

  const curves = useMemo(() => generateCurves(), [waviness, staggeredRotation, numPetals, numLayers, innerRadiusMin, innerRadiusMax, angleRange, innerAmplitude, strokeWidth, opacityBase, opacityVariation, lineRotationSpread, size]);

  const [springs, api] = useSpring(() => ({
    t: 1,
    config: { 
      tension: 300,
      friction: 30,
      mass: 1,
    }
  }));

  // Trigger smooth animation when curves change
  React.useEffect(() => {
    if (oldCurvesRef.current && oldCurvesRef.current.length === curves.length) {
      // Create custom interpolators
      interpolatorsRef.current = curves.map((newCurve, i) =>
        interpolateCurve(oldCurvesRef.current![i], newCurve)
      );
      // Smooth animation with easing
      api.start({ 
        from: { t: 0 },
        to: { t: 1 }
      });
    } else {
      // First render or curve count changed
      interpolatorsRef.current = null;
      api.set({ t: 1 });
    }
    oldCurvesRef.current = [...curves];
  }, [curves, api]);

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
          background: 'hsl(var(--logo-bg))', 
          transform: `scale(3)`,
          willChange: 'transform' // Optimize for GPU acceleration
        }}
      >
        {curves.map((curve, index) => (
          <animated.path
            key={`${curve.type}-${curve.petal}-${curve.layer}-${index}`}
            d={springs.t.to(() => getCurrentPath(index))}
            fill="none"
            stroke="hsl(var(--logo-stroke))"
            strokeWidth={curve.type === 'petal' ? strokeWidth : strokeWidth * 0.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={opacityBase + ((curve.layer + curve.petal) % 3) * opacityVariation}
            transform={`translate(${size/2} ${size/2}) rotate(${(index / curves.length) * lineRotationSpread}) translate(${-size/2} ${-size/2})`}
            style={{
              vectorEffect: 'non-scaling-stroke',
              willChange: 'd' // Optimize path animations
            }}
          />
        ))}
      </animated.svg>
    </div>
  );
};