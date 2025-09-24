import { ParametricLogo } from "@/components/ParametricLogo";
import { ConfigDrawer } from "@/components/ConfigDrawer";
import { Leva, useControls, button } from "leva";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Configuration for all controls
const controlConfigs = {
  waviness: { min: 0.1, max: 2, step: 0.1 },
  staggeredRotation: { min: 0, max: 1, step: 0.05 },
  numPetals: { min: 3, max: 12, step: 1 },
  numLayers: { min: 50, max: 100, step: 5 },
  innerRadiusMin: { min: 0, max: 0.3, step: 0.02 },
  innerRadiusMax: { min: 0, max: 0.3, step: 0.02 },
  angleRange: { min: Math.PI / 6, max: Math.PI, step: 0.05 },
  innerAmplitude: { min: 0, max: 1, step: 0.1 },
  strokeWidth: { min: 0.5, max: 1, step: 0.1 },
  opacityBase: { min: 0.1, max: 1, step: 0.05 },
  opacityVariation: { min: 0, max: 0.4, step: 0.05 },
  lineRotationSpread: { min: 0, max: 180, step: 5 },
  animationDuration: { min: 200, max: 3000, step: 100 },
};

// Helper to round value to step
const roundToStep = (value: number, step: number) => {
  return Math.round(value / step) * step;
};

// Helper to get number of decimals for a step
const getDecimals = (step: number) => {
  return Math.max(0, Math.ceil(-Math.log10(step)));
};

// Helper to format number to avoid floating point precision issues
const formatNumber = (value: number, step: number) => {
  const decimals = getDecimals(step);
  return parseFloat(value.toFixed(decimals));
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [savedConfigs, setSavedConfigs] = useState<string[]>([]);

  // Keys that should be saved to URL
  const urlKeys = Object.keys(controlConfigs);

  // Get initial controls from URL or random
  const getInitialControls = () => {
    const hasUrlParams = urlKeys.some(key => searchParams.has(key));
    if (!hasUrlParams) {
      return {
        waviness: formatNumber(roundToStep(Math.random() * 1.9 + 0.1, controlConfigs.waviness.step), controlConfigs.waviness.step),
        staggeredRotation: formatNumber(roundToStep(Math.random(), controlConfigs.staggeredRotation.step), controlConfigs.staggeredRotation.step),
        numPetals: Math.floor(Math.random() * 9) + 3,
        numLayers: roundToStep(Math.floor(Math.random() * 25) + 50, controlConfigs.numLayers.step),
        innerRadiusMin: formatNumber(roundToStep(Math.random() * 0.3, controlConfigs.innerRadiusMin.step), controlConfigs.innerRadiusMin.step),
        innerRadiusMax: formatNumber(roundToStep(Math.random() * 0.3, controlConfigs.innerRadiusMax.step), controlConfigs.innerRadiusMax.step),
        angleRange: formatNumber(roundToStep(Math.random() * (Math.PI - Math.PI / 6) + Math.PI / 6, controlConfigs.angleRange.step), controlConfigs.angleRange.step),
        innerAmplitude: formatNumber(roundToStep(Math.random(), controlConfigs.innerAmplitude.step), controlConfigs.innerAmplitude.step),
        strokeWidth: formatNumber(roundToStep(Math.random() * 0.5 + 0.5, controlConfigs.strokeWidth.step), controlConfigs.strokeWidth.step),
        opacityBase: formatNumber(roundToStep(Math.random() * 0.9 + 0.1, controlConfigs.opacityBase.step), controlConfigs.opacityBase.step),
        opacityVariation: formatNumber(roundToStep(Math.random() * 0.4, controlConfigs.opacityVariation.step), controlConfigs.opacityVariation.step),
        lineRotationSpread: roundToStep(Math.random() * 180, controlConfigs.lineRotationSpread.step),
        animationDuration: 800,
        backgroundColor: "#000000",
        lineColor: "#4980ff",
      };
    }

    return {
      waviness: parseFloat(searchParams.get('waviness') || '1'),
      staggeredRotation: parseFloat(searchParams.get('staggeredRotation') || '0.5'),
      numPetals: parseInt(searchParams.get('numPetals') || '6'),
      numLayers: parseFloat(searchParams.get('numLayers') || '75'),
      innerRadiusMin: parseFloat(searchParams.get('innerRadiusMin') || '0.15'),
      innerRadiusMax: parseFloat(searchParams.get('innerRadiusMax') || '0.15'),
      angleRange: parseFloat(searchParams.get('angleRange') || '2.5'),
      innerAmplitude: parseFloat(searchParams.get('innerAmplitude') || '0.5'),
      strokeWidth: parseFloat(searchParams.get('strokeWidth') || '0.75'),
      opacityBase: parseFloat(searchParams.get('opacityBase') || '0.55'),
      opacityVariation: parseFloat(searchParams.get('opacityVariation') || '0.2'),
      lineRotationSpread: parseFloat(searchParams.get('lineRotationSpread') || '90'),
      animationDuration: parseInt(searchParams.get('animationDuration') || '800'),
      backgroundColor: searchParams.get('backgroundColor') || '#000000',
      lineColor: searchParams.get('lineColor') || '#4980ff',
    };
  };

  // Calculate initial scale to fit screen properly
  const getInitialScale = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    // Scale to fit the smaller dimension, with some padding
    const visualLogoSize = 400 * 3; // 1200px
    const scale = (Math.min(screenWidth, screenHeight) / visualLogoSize) * 0.7;
    return Math.max(0.1, scale); // Minimum scale
  };

  // Calculate max scale for zoom limits
  const getMaxScale = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    // Allow zooming to fill the screen
    const visualLogoSize = 400 * 3; // 1200px
    return Math.max(
      1,
      (Math.max(screenWidth, screenHeight) / visualLogoSize) * 1.2,
    );
  };

  const [logoScale, setLogoScale] = useState(() => {
    if (typeof window !== "undefined") {
      return getInitialScale();
    }
    return 0.8; // Fallback for SSR
  });

  useEffect(() => {
    const keys = Object.keys(localStorage)
      .filter((key) => key.startsWith("logoConfig_"))
      .map((key) => key.replace("logoConfig_", ""))
      .sort((a, b) => b.localeCompare(a)); // Sort newest first
    setSavedConfigs(keys);
  }, []);

  const initialControls = getInitialControls();

  const randomize = () => {
    // Randomize shape-changing params less frequently to maintain animation
    const randomizeShape = Math.random() < 0.3; // 30% chance to change numPetals/numLayers
    setControls({
      waviness: Math.random() * 1.9 + 0.1,
      staggeredRotation: Math.random(),
      numPetals: randomizeShape
        ? Math.floor(Math.random() * 9) + 3
        : controls.numPetals,
      numLayers: randomizeShape
        ? Math.floor(Math.random() * 25) + 50
        : controls.numLayers,
      innerRadiusMin: Math.random() * 0.3,
      innerRadiusMax: Math.random() * 0.3,
      angleRange: Math.random() * (Math.PI - Math.PI / 6) + Math.PI / 6,
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

  const [controls, setControls] = useControls(() => ({
    randomize: button(randomize),
    waviness: { value: initialControls.waviness, ...controlConfigs.waviness },
    staggeredRotation: { value: initialControls.staggeredRotation, ...controlConfigs.staggeredRotation },
    numPetals: { value: initialControls.numPetals, ...controlConfigs.numPetals },
    numLayers: { value: initialControls.numLayers, ...controlConfigs.numLayers },
    innerRadiusMin: { value: initialControls.innerRadiusMin, ...controlConfigs.innerRadiusMin },
    innerRadiusMax: { value: initialControls.innerRadiusMax, ...controlConfigs.innerRadiusMax },
    angleRange: { value: initialControls.angleRange, ...controlConfigs.angleRange },
    innerAmplitude: { value: initialControls.innerAmplitude, ...controlConfigs.innerAmplitude },
    strokeWidth: { value: initialControls.strokeWidth, ...controlConfigs.strokeWidth },
    opacityBase: { value: initialControls.opacityBase, ...controlConfigs.opacityBase },
    opacityVariation: { value: initialControls.opacityVariation, ...controlConfigs.opacityVariation },
    lineRotationSpread: { value: initialControls.lineRotationSpread, ...controlConfigs.lineRotationSpread },
    animationDuration: { value: initialControls.animationDuration, ...controlConfigs.animationDuration },
    backgroundColor: { value: initialControls.backgroundColor },
    lineColor: { value: initialControls.lineColor },
  }));

  // Update URL when controls change
  useEffect(() => {
    const newParams = new URLSearchParams();
    urlKeys.forEach(key => {
      const value = controls[key as keyof typeof controls];
      if (typeof value === 'number') {
        const config = controlConfigs[key as keyof typeof controlConfigs];
        const roundedValue = roundToStep(value, config.step);
        const formattedValue = formatNumber(roundedValue, config.step);
        newParams.set(key, formattedValue.toString());
      } else if (typeof value === 'string') {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams, { replace: true });
  }, [controls, setSearchParams, urlKeys]);

  const saveConfig = () => {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[T:]/g, "-");
    const randomId = Math.random().toString(36).substr(2, 6);
    const configName = `config-${timestamp}-${randomId}`;

    localStorage.setItem(`logoConfig_${configName}`, JSON.stringify(controls));
    setSavedConfigs((prev) => [configName, ...prev]); // Add newest first
  };

  const loadConfig = (name: string) => {
    const config = localStorage.getItem(`logoConfig_${name}`);
    if (config) {
      setControls(JSON.parse(config));
    }
  };

  const exportAsSVG = () => {
    const logoContainer = document.querySelector(
      "[data-logo-container]",
    ) as HTMLElement;
    if (!logoContainer) return;

    const svgElement = logoContainer.querySelector("svg") as SVGElement;
    if (!svgElement) return;

    // Clone the SVG and clean it up for export
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    svgClone.style.transform = "none";
    svgClone.removeAttribute("class");

    // Create clean SVG string
    const svgString = new XMLSerializer().serializeToString(svgClone);

    // Download SVG
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `parametric-logo-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  const exportAsPNG = async () => {
    const logoContainer = document.querySelector(
      "[data-logo-container]",
    ) as HTMLElement;
    if (!logoContainer) return;

    const svgElement = logoContainer.querySelector("svg") as SVGElement;
    if (!svgElement) return;

    try {
      const { toPng } = await import("html-to-image");

      // Create a clean SVG copy for export
      const svgClone = svgElement.cloneNode(true) as SVGElement;
      svgClone.removeAttribute("style");
      svgClone.setAttribute("width", "1200");
      svgClone.setAttribute("height", "1200");

      // Serialize SVG to string
      const svgString = new XMLSerializer().serializeToString(svgClone);
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

      // Create an img element with the SVG
      const img = document.createElement("img");
      img.src = svgDataUrl;
      img.style.width = "1200px";
      img.style.height = "1200px";

      // Create a temporary container for the img
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      tempContainer.style.width = "1200px";
      tempContainer.style.height = "1200px";
      tempContainer.style.backgroundColor = controls.backgroundColor;
      tempContainer.appendChild(img);
      document.body.appendChild(tempContainer);

      // Wait for img to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const dataUrl = await toPng(tempContainer, {
        quality: 1.0,
        pixelRatio: 1,
        backgroundColor: controls.backgroundColor,
        width: 1200,
        height: 1200,
      });

      // Clean up
      document.body.removeChild(tempContainer);

      // Create download link
      const link = document.createElement("a");
      link.download = `parametric-logo-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("PNG export failed:", error);
      alert("PNG export failed. Please try SVG export instead.");
    }
  };

  // Handle scroll wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;

    // Use dynamic max scale calculation
    const maxScale = getMaxScale();

    setLogoScale((prev) => Math.max(0.2, Math.min(maxScale, prev + delta)));
  };

  return (
    <div
      className="flex min-h-screen overflow-hidden items-center justify-center"
      style={{ backgroundColor: controls.backgroundColor }}
    >
      <div className="text-center space-y-8">
        <div
          className="mx-auto"
          onWheel={handleWheel}
          style={{
            transform: `scale(${logoScale})`,
            transformOrigin: "center",
          }}
          data-logo-container
        >
          <ParametricLogo size={400} className="mx-auto" {...controls} />
        </div>
      </div>

      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 font-mono text-gray-500 text-center pointer-events-none">
        Mandametric by <a href="https://github.com/schmuecker" target="_blank" className="underline pointer-events-auto">@schmuecker</a>
      </div>

      <ConfigDrawer
        controls={controls}
        savedConfigs={savedConfigs}
        onSaveConfig={saveConfig}
        onLoadConfig={loadConfig}
        onExportSVG={exportAsSVG}
        onExportPNG={exportAsPNG}
      />

      <Leva />
    </div>
  );
};

export default Index;
