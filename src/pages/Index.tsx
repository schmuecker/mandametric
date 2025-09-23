import { ParametricLogo } from "@/components/ParametricLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Leva, useControls } from "leva";
import { useState, useEffect } from "react";

const Index = () => {
  const [savedConfigs, setSavedConfigs] = useState<string[]>([]);

  useEffect(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('logoConfig_')).map(key => key.replace('logoConfig_', ''));
    setSavedConfigs(keys);
  }, []);

  const [controls, setControls] = useControls(() => ({
    waviness: { value: 1, min: 0, max: 2, step: 0.1 },
    staggeredRotation: { value: 0, min: 0, max: Math.PI * 2, step: 0.1 },
    numPetals: { value: 3, min: 1, max: 10, step: 1 },
    numLayers: { value: 12, min: 1, max: 20, step: 1 },
    innerRadiusMin: { value: 0.15, min: 0, max: 2, step: 0.1 },
    innerRadiusMax: { value: 0.45, min: 0, max: 2, step: 0.1 },
    angleRange: { value: Math.PI / 2.5, min: 0.1, max: Math.PI, step: 0.1 },
    innerAmplitude: { value: 0.4, min: 0, max: 1, step: 0.1 },
    strokeWidth: { value: 2, min: 0.5, max: 1, step: 0.1 },
    opacityBase: { value: 0.8, min: 0, max: 1, step: 0.1 },
    opacityVariation: { value: 0.1, min: 0, max: 0.5, step: 0.05 },
    lineRotationSpread: { value: 0, min: 0, max: 360, step: 1 },
  }));

  const randomize = () => {
    const randomParams = {
      waviness: Math.random() * 2,
      staggeredRotation: Math.random() * Math.PI * 2,
      numPetals: Math.floor(Math.random() * 10) + 1,
      numLayers: Math.floor(Math.random() * 20) + 1,
      innerRadiusMin: Math.random() * 2,
      innerRadiusMax: Math.random() * 2,
      angleRange: Math.random() * Math.PI + 0.1,
      innerAmplitude: Math.random(),
      strokeWidth: Math.random() * 0.5 + 0.5,
      opacityBase: Math.random(),
      opacityVariation: Math.random() * 0.5,
      lineRotationSpread: Math.random() * 360,
    };
    setControls(randomParams);
  };

  const saveConfig = () => {
    const configName = prompt("Enter a name for this config:");
    if (configName) {
      localStorage.setItem(`logoConfig_${configName}`, JSON.stringify(controls));
      setSavedConfigs(prev => [...prev, configName]);
    }
  };

  const loadConfig = (name: string) => {
    const config = localStorage.getItem(`logoConfig_${name}`);
    if (config) {
      setControls(JSON.parse(config));
    }
  };

  const exportAsSVG = () => {
    const svgString = (window as any).cleanSVGString;
    
    if (svgString) {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'parametric-logo.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-logo-bg">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-logo-stroke">Parametric Logo</h3>
          <ParametricLogo size={400} className="mx-auto" {...controls} />

        </div>
         <div className="space-y-4">
           <h1 className="text-4xl font-bold text-logo-stroke">Parametric Logo Generator</h1>
           <p className="text-xl text-logo-stroke/80">Adjust parameters using the Leva GUI to customize the logo</p>
          <Button 
            onClick={exportAsSVG}
            className="bg-logo-stroke text-logo-bg hover:bg-logo-stroke/90"
          >
            Export Clean SVG
          </Button>
        </div>
      </div>
      <Card className="absolute bottom-4 right-4 p-4 bg-white/90 backdrop-blur">
        <div className="flex gap-2 mb-4">
          <Button onClick={randomize}>Randomize</Button>
          <Button onClick={saveConfig}>Save Config</Button>
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
