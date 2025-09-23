import { ParametricLogo } from "@/components/ParametricLogo";
import { ConfigDrawer } from "@/components/ConfigDrawer";
import { Leva, useControls, button } from "leva";
import { useState, useEffect } from "react";

const Index = () => {
  const [savedConfigs, setSavedConfigs] = useState<string[]>([]);

  // Calculate initial scale to fit screen properly
  const getInitialScale = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    // Scale to fit the smaller dimension, with some padding
    const visualLogoSize = 400 * 3; // 1200px
    const scale = (Math.min(screenWidth, screenHeight) / visualLogoSize) * 0.9;
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
    waviness: { value: 0.8, min: 0.1, max: 2, step: 0.1 },
    staggeredRotation: { value: 0.2, min: 0, max: 1, step: 0.05 },
    numPetals: { value: 6, min: 3, max: 12, step: 1 },
    numLayers: { value: 70, min: 50, max: 100, step: 5 },
    innerRadiusMin: { value: 0.1, min: 0, max: 0.3, step: 0.02 },
    innerRadiusMax: { value: 0.25, min: 0, max: 0.3, step: 0.02 },
    angleRange: {
      value: Math.PI / 3,
      min: Math.PI / 6,
      max: Math.PI,
      step: 0.05,
    },
    innerAmplitude: { value: 0.3, min: 0, max: 1, step: 0.1 },
    strokeWidth: { value: 0.8, min: 0.5, max: 1, step: 0.1 },
    opacityBase: { value: 0.7, min: 0.1, max: 1, step: 0.05 },
    opacityVariation: { value: 0.15, min: 0, max: 0.4, step: 0.05 },
    lineRotationSpread: { value: 0, min: 0, max: 180, step: 5 },
    animationDuration: { value: 800, min: 200, max: 3000, step: 100 },
    backgroundColor: { value: "#000000" },
    lineColor: { value: "#4980ff" },
  }));

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
