import { useEffect, useRef } from "react";

interface InterferenceCanvasProps {
  wavelength: number; // nm
  separation: number; // mm
  distance: number; // cm
  width?: number;
  height?: number;
}

export function InterferenceCanvas({
  wavelength,
  separation,
  distance,
}: InterferenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert wavelength to RGB color for visualization tint
  const getWavelengthColor = (wl: number) => {
    let r, g, b;
    if (wl >= 380 && wl < 440) {
      r = -(wl - 440) / (440 - 380);
      g = 0;
      b = 1;
    } else if (wl >= 440 && wl < 490) {
      r = 0;
      g = (wl - 440) / (490 - 440);
      b = 1;
    } else if (wl >= 490 && wl < 510) {
      r = 0;
      g = 1;
      b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
      r = (wl - 510) / (580 - 510);
      g = 1;
      b = 0;
    } else if (wl >= 580 && wl < 645) {
      r = 1;
      g = -(wl - 645) / (645 - 580);
      b = 0;
    } else if (wl >= 645 && wl <= 780) {
      r = 1;
      g = 0;
      b = 0;
    } else {
      r = 0;
      g = 0;
      b = 0;
    }

    // Intensity falloff near limits
    let factor;
    if (wl >= 380 && wl < 420) {
      factor = 0.3 + (0.7 * (wl - 380)) / (420 - 380);
    } else if (wl >= 420 && wl < 701) {
      factor = 1.0;
    } else if (wl >= 701 && wl < 780) {
      factor = 0.3 + (0.7 * (780 - wl)) / (780 - 700);
    } else {
      factor = 0.0;
    }

    return {
      r: Math.round(r * factor * 255),
      g: Math.round(g * factor * 255),
      b: Math.round(b * factor * 255),
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Handle resizing
    const updateSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    };

    const draw = () => {
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      // Physics Constants & Conversion
      // Calculation units: mm
      const L = distance * 10; // cm -> mm
      const d = separation; // mm
      const lambda = wavelength * 1e-6; // nm -> mm (1 nm = 1e-6 mm)
      const k = (2 * Math.PI) / lambda;

      // Screen physical dimensions (arbitrary scale for visualization)
      // Let's say the screen represents a 100mm x 100mm area centered at 0,0
      const screenPhysicalWidth = 200; // mm
      const mmPerPixel = screenPhysicalWidth / width;

      const halfWidth = width / 2;
      const halfHeight = height / 2;

      // Color tint based on wavelength
      const tint = getWavelengthColor(wavelength);

      // Pre-calculate squared constants
      const L2 = L * L;
      const dHalf = d / 2;

      for (let y = 0; y < height; y++) {
        // Physical y coordinate (centered)
        const yPhys = (y - halfHeight) * mmPerPixel;
        const y2 = yPhys * yPhys;

        for (let x = 0; x < width; x++) {
          // Physical x coordinate (centered)
          const xPhys = (x - halfWidth) * mmPerPixel;

          // Source 1: (-d/2, 0)
          const r1 = Math.sqrt(Math.pow(xPhys + dHalf, 2) + y2 + L2);

          // Source 2: (d/2, 0)
          const r2 = Math.sqrt(Math.pow(xPhys - dHalf, 2) + y2 + L2);

          // Phase difference
          const deltaR = r2 - r1;
          const phaseDiff = k * deltaR;

          // Intensity I = I0 * cos^2(deltaPhi / 2)
          // Simplified: I ~ 1 + cos(deltaPhi)
          // Range [0, 2] -> Normalize to [0, 1]
          const intensity = 0.5 * (1 + Math.cos(phaseDiff));

          // Apply falloff (optional, realistic intensity drops with distance 1/r^2)
          // For visualization clarity, we might ignore 1/r^2 falloff or make it subtle
          const falloff = 1.0; // Math.min(1, 10000 / (r1 * r1)); 

          const idx = (y * width + x) * 4;
          
          // Map intensity to RGB
          // We use the wavelength color, scaled by intensity
          // Add a base low-light to see the "dark" fringes slightly if desired, or pure black
          data[idx] = tint.r * intensity * falloff;     // R
          data[idx + 1] = tint.g * intensity * falloff; // G
          data[idx + 2] = tint.b * intensity * falloff; // B
          data[idx + 3] = 255;                          // Alpha
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, [wavelength, separation, distance]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-black overflow-hidden rounded-xl shadow-inner border border-border/50">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Overlay info */}
      <div className="absolute top-4 right-4 text-xs font-mono text-white/50 bg-black/50 p-2 rounded backdrop-blur-sm pointer-events-none">
        <div>Resolution: High</div>
        <div>Render: GPU/CPU</div>
      </div>
    </div>
  );
}
