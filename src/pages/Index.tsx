import { ParametricLogo } from "@/components/ParametricLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Leva, useControls } from "leva";
import { useState, useEffect } from "react";

const Index = () => {
  const [savedConfigs, setSavedConfigs] = useState<string[]>([]);
  
  // Calculate initial scale to fit screen properly
  const getInitialScale = () => {
    const screenWidth = window.innerWidth;
    // Start at a reasonable default size, not constrained by max
    return 0.8;
  };
  
  // Calculate max scale for zoom limits
  const getMaxScale = () => {
    const screenWidth = window.innerWidth;
    // Allow zooming to nearly full screen width
    return Math.max(1, (screenWidth - 100) / (400 * 3)); // Only 100px padding
  };
  
  const [logoScale, setLogoScale] = useState(() => {
    if (typeof window !== 'undefined') {
      return getInitialScale();
    }
    return 0.8; // Fallback for SSR
  });

  useEffect(() => {
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith('logoConfig_'))
      .map(key => key.replace('logoConfig_', ''))
      .sort((a, b) => b.localeCompare(a)); // Sort newest first
    setSavedConfigs(keys);
  }, []);

  const [controls, setControls] = useControls(() => ({
    waviness: { value: 0.8, min: 0.1, max: 2, step: 0.1 },
    staggeredRotation: { value: 0.2, min: 0, max: 1, step: 0.05 },
    numPetals: { value: 6, min: 3, max: 12, step: 1 },
    numLayers: { value: 70, min: 50, max: 100, step: 5 },
    innerRadiusMin: { value: 0.1, min: 0, max: 0.3, step: 0.02 },
    innerRadiusMax: { value: 0.25, min: 0, max: 0.3, step: 0.02 },
    angleRange: { value: Math.PI / 3, min: Math.PI / 6, max: Math.PI, step: 0.05 },
    innerAmplitude: { value: 0.3, min: 0, max: 1, step: 0.1 },
    strokeWidth: { value: 0.8, min: 0.5, max: 1, step: 0.1 },
    opacityBase: { value: 0.7, min: 0.1, max: 1, step: 0.05 },
    opacityVariation: { value: 0.15, min: 0, max: 0.4, step: 0.05 },
    lineRotationSpread: { value: 0, min: 0, max: 180, step: 5 },
    animationDuration: { value: 800, min: 200, max: 3000, step: 100 },
    backgroundColor: { value: '#fafafa' },
    lineColor: { value: '#0f172a' },
  }));

  const randomize = () => {
    // Randomize shape-changing params less frequently to maintain animation
    const randomizeShape = Math.random() < 0.3; // 30% chance to change numPetals/numLayers
    setControls({
      waviness: Math.random() * 1.9 + 0.1,
      staggeredRotation: Math.random(),
      numPetals: randomizeShape ? Math.floor(Math.random() * 9) + 3 : controls.numPetals,
      numLayers: randomizeShape ? Math.floor(Math.random() * 25) + 50 : controls.numLayers,
      innerRadiusMin: Math.random() * 0.3,
      innerRadiusMax: Math.random() * 0.3,
      angleRange: Math.random() * (Math.PI - Math.PI/6) + Math.PI/6,
      innerAmplitude: Math.random(),
      strokeWidth: Math.random() * 0.5 + 0.5,
      opacityBase: Math.random() * 0.9 + 0.1,
      opacityVariation: Math.random() * 0.4,
      lineRotationSpread: Math.random() * 180,
      // Don't randomize background color, line color, or animation duration
      backgroundColor: controls.backgroundColor,
      lineColor: controls.lineColor,
      animationDuration: controls.animationDuration,
    });
  };

  const saveConfig = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const randomId = Math.random().toString(36).substr(2, 6);
    const configName = `config-${timestamp}-${randomId}`;
    
    localStorage.setItem(`logoConfig_${configName}`, JSON.stringify(controls));
    setSavedConfigs(prev => [configName, ...prev]); // Add newest first
  };

  const loadConfig = (name: string) => {
    const config = localStorage.getItem(`logoConfig_${name}`);
    if (config) {
      setControls(JSON.parse(config));
    }
  };

  const exportAsSVG = () => {
    const logoContainer = document.querySelector('[data-logo-container]') as HTMLElement;
    if (!logoContainer) return;

    const svgElement = logoContainer.querySelector('svg') as SVGElement;
    if (!svgElement) return;

    // Clone the SVG and clean it up for export
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    svgClone.style.transform = 'none';
    svgClone.removeAttribute('class');
    
    // Create clean SVG string
    const svgString = new XMLSerializer().serializeToString(svgClone);
    
    // Download SVG
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `parametric-logo-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  const exportAsPNG = async () => {
    const logoContainer = document.querySelector('[data-logo-container]') as HTMLElement;
    if (!logoContainer) return;

    try {
      const { toPng } = await import('html-to-image');
      
      const dataUrl = await toPng(logoContainer, {
        quality: 1.0,
        pixelRatio: 4, // 4x resolution for high quality
        backgroundColor: controls.backgroundColor,
        width: 400, // Fixed size for consistent export
        height: 400,
        style: {
          transform: 'scale(1)', // No additional scaling
          transformOrigin: 'center',
        },
        filter: (node) => {
          // Reset SVG to normal scale for export
          if (node.tagName === 'svg') {
            (node as any).style.transform = 'scale(1)'; // Remove the internal scale(3)
            (node as any).setAttribute('width', '400');
            (node as any).setAttribute('height', '400');
          }
          return true;
        },
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `parametric-logo-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('PNG export failed:', error);
      alert('PNG export failed. Please try SVG export instead.');
    }
  };

  // Handle scroll wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    
    // Use dynamic max scale calculation
    const maxScale = getMaxScale();
    
    setLogoScale(prev => Math.max(0.2, Math.min(maxScale, prev + delta)));
  };

   return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: controls.backgroundColor }}>
      <div className="text-center space-y-8">
        <div 
          className="mx-auto cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          style={{ transform: `scale(${logoScale})`, transformOrigin: 'center' }}
          data-logo-container
        >
          <ParametricLogo size={400} className="mx-auto" {...controls} />
        </div>
      </div>
      <Card className="absolute bottom-4 right-4 p-4 bg-white/90 backdrop-blur">
        <div className="flex gap-2 mb-4">
          <Button onClick={randomize}>Randomize</Button>
          <Button onClick={saveConfig}>Save Config</Button>
        </div>
        <div className="flex gap-2 mb-4">
          <Button onClick={exportAsSVG} variant="outline">Export SVG</Button>
          <Button onClick={exportAsPNG} variant="outline">Export PNG</Button>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-2">Saved Configs</h4>
          <ul className="space-y-1">
            {savedConfigs.map(name => (
              <li key={name} className="flex items-center gap-2">
                <span className="text-sm">{name}</span>
                <Button size="sm" onClick={() => loadConfig(name)}>Load</Button>
              </li>
            ))}
          </ul>
        </div>
      </Card>
      <Leva />
    </div>
  );
};

export default Index;
