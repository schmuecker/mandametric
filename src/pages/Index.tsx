import { ParametricLogo } from "@/components/ParametricLogo";
import { Button } from "@/components/ui/button";

const Index = () => {
  const exportAsSVG = () => {
    const logoContainer = document.getElementById('logo-container');
    const svgElement = logoContainer?.querySelector('svg');
    
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
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
        <div id="logo-container">
          <ParametricLogo size={800} className="mx-auto" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-logo-stroke">Parametric Star Logo</h1>
          <p className="text-xl text-logo-stroke/80">Mathematically generated 3-petal geometric pattern</p>
          <Button 
            onClick={exportAsSVG}
            className="bg-logo-stroke text-logo-bg hover:bg-logo-stroke/90"
          >
            Export as SVG
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
