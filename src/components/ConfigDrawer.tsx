import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Settings, Code, FileImage, IterationCw } from "lucide-react";

interface LogoControls {
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

interface ConfigDrawerProps {
  controls: LogoControls;
  savedConfigs: string[];
  onSaveConfig: () => void;
  onLoadConfig: (name: string) => void;
  onExportSVG: () => void;
  onExportPNG: () => void;
}

export const ConfigDrawer: React.FC<ConfigDrawerProps> = ({
  controls,
  savedConfigs,
  onSaveConfig,
  onLoadConfig,
  onExportSVG,
  onExportPNG,
}) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Open configuration</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <div className="max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle>Configuration</DrawerTitle>
            <DrawerDescription>
              Customize and export your parametric logo
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-4 p-4">
            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={onExportSVG}
                variant="outline"
                className="flex-1"
              >
                <Code className="w-4 h-4 mr-2" />
                Export SVG
              </Button>
              <Button
                onClick={onExportPNG}
                variant="outline"
                className="flex-1"
              >
                <FileImage className="w-4 h-4 mr-2" />
                Export PNG
              </Button>
            </div>

            {/* Saved Configs */}
            {savedConfigs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium pt-4">Saved Configurations</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {savedConfigs.map((name) => (
                    <div
                      key={name}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                    >
                      <span className="text-sm flex-1 truncate">{name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onLoadConfig(name)}
                      >
                        <IterationCw className="w-4 h-4" />
                        <span className="sr-only">Load</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={onSaveConfig} className="w-full">
                Save Config
              </Button>
            </div>
          </div>

          <DrawerClose asChild>
            <div className="w-full px-4">
              <Button variant="outline" className="w-full mb-4">
                Close
              </Button>
            </div>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
