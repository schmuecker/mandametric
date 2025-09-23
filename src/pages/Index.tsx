import { ParametricLogo } from "@/components/ParametricLogo";
import { CleanSVGLogo } from "@/components/CleanSVGLogo";
import { Button } from "@/components/ui/button";

const Index = () => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-logo-stroke">Original Complex Logo</h3>
            <ParametricLogo size={400} className="mx-auto" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-logo-stroke">Clean SVG Version</h3>
            <CleanSVGLogo size={400} className="mx-auto" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-logo-stroke">Parametric Star Logo</h1>
          <p className="text-xl text-logo-stroke/80">Mathematically generated 3-petal geometric pattern</p>
          <Button 
            onClick={exportAsSVG}
            className="bg-logo-stroke text-logo-bg hover:bg-logo-stroke/90"
          >
            Export Clean SVG
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
