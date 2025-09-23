import { ParametricLogo } from "@/components/ParametricLogo";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-logo-bg">
      <div className="text-center space-y-8">
        <div className="flex gap-8 justify-center items-center">
          <ParametricLogo size={400} className="mx-auto" />
          <ParametricLogo size={400} className="mx-auto" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-logo-stroke">Parametric Star Logo</h1>
          <p className="text-xl text-logo-stroke/80">Mathematically generated 5-petal geometric pattern</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
