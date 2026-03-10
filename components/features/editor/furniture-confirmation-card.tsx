"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

// This type should ideally be defined in a shared types file e.g., types/editor.ts
type DetectedObject = {
  label: string;
  confidence: number;
  width_m: number;
  height_m: number;
  elevation_m: number;
  distance_m: number;
  center_pixel: [number, number];
  catalogItem: any; // Replace 'any' with a proper type for catalog items
};

interface FurnitureConfirmationCardProps {
  detectedObject: DetectedObject;
  onConfirm: (
    detectedObject: DetectedObject,
    dimensions: { width: number; height: number; depth: number },
  ) => void;
  onDiscard: () => void;
  totalItems: number;
  currentIndex: number;
}

export function FurnitureConfirmationCard({
  detectedObject,
  onConfirm,
  onDiscard,
  totalItems,
  currentIndex,
}: FurnitureConfirmationCardProps) {
  const { catalogItem, width_m, height_m } = detectedObject;

  const [dimensions, setDimensions] = useState({
    width: width_m,
    height: height_m,
    depth: catalogItem.dimensions.depth,
  });

  // Reset dimensions when the detected object changes
  useEffect(() => {
    setDimensions({
      width: detectedObject.width_m,
      height: detectedObject.height_m,
      depth: detectedObject.catalogItem.dimensions.depth,
    });
  }, [detectedObject]);

  const handleDimensionChange = (
    axis: "width" | "height" | "depth",
    value: number,
  ) => {
    // Clamp the value to be non-negative
    const clampedValue = Math.max(0, value);
    setDimensions((prev) => ({ ...prev, [axis]: clampedValue }));
  };

  const formatNumber = (num: number) => (Math.round(num * 100) / 100).toFixed(2);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <Card className="w-[400px] max-w-[90%]">
        <CardHeader>
          <CardTitle>
            ยืนยันเฟอร์นิเจอร์ ({currentIndex + 1}/{totalItems})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI ตรวจพบ: <strong>{catalogItem.name}</strong> (ความแม่นยำ:{" "}
            {Math.round(detectedObject.confidence * 100)}%)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="width">ความกว้าง (เมตร)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="width"
                type="number"
                value={formatNumber(dimensions.width)}
                onChange={(e) =>
                  handleDimensionChange("width", parseFloat(e.target.value))
                }
                className="w-24"
              />
              <Slider
                value={[dimensions.width]}
                onValueChange={([val]) => handleDimensionChange("width", val)}
                max={5}
                step={0.05}
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="height">ความสูง (เมตร)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="height"
                type="number"
                value={formatNumber(dimensions.height)}
                onChange={(e) =>
                  handleDimensionChange("height", parseFloat(e.target.value))
                }
                className="w-24"
              />
              <Slider
                value={[dimensions.height]}
                onValueChange={([val]) => handleDimensionChange("height", val)}
                max={4}
                step={0.05}
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="depth">ความลึก (เมตร)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="depth"
                type="number"
                value={formatNumber(dimensions.depth)}
                onChange={(e) =>
                  handleDimensionChange("depth", parseFloat(e.target.value))
                }
                className="w-24"
              />
              <Slider
                value={[dimensions.depth]}
                onValueChange={([val]) => handleDimensionChange("depth", val)}
                max={3}
                step={0.05}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onDiscard}>
            ข้าม
          </Button>
          <Button onClick={() => onConfirm(detectedObject, dimensions)}>
            ยืนยันและเพิ่ม
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
