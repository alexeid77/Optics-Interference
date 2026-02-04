import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  RotateCcw,
  Info,
  Beaker,
  Trash2,
  FolderOpen,
  Waves,
  Ruler,
  Maximize2
} from "lucide-react";

import { useConfigurations, useCreateConfiguration, useDeleteConfiguration } from "@/hooks/use-configurations";
import { InterferenceCanvas } from "@/components/InterferenceCanvas";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default function Home() {
  // State for Physics Parameters
  const [wavelength, setWavelength] = useState(500); // nm
  const [separation, setSeparation] = useState(0.5); // mm
  const [distance, setDistance] = useState(100); // cm
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);

  // Queries & Mutations
  const { data: configurations, isLoading: isLoadingConfigs } = useConfigurations();
  const createConfig = useCreateConfiguration();
  const deleteConfig = useDeleteConfiguration();

  // Form for Saving
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const handleSave = (values: z.infer<typeof formSchema>) => {
    createConfig.mutate(
      {
        name: values.name,
        wavelength,
        separation,
        distance,
      },
      {
        onSuccess: () => {
          setIsSaveDialogOpen(false);
          form.reset();
        },
      }
    );
  };

  const handleReset = () => {
    setWavelength(500);
    setSeparation(0.5);
    setDistance(100);
  };

  const loadConfiguration = (config: any) => {
    setWavelength(config.wavelength);
    setSeparation(config.separation);
    setDistance(config.distance);
    setIsLoadDialogOpen(false);
  };

  const formatWavelengthColor = (wl: number) => {
    // Just a rough CSS approximation for the label dot
    const h = 280 - ((wl - 380) / (750 - 380)) * 280;
    return `hsl(${h}, 100%, 50%)`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans science-grid">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Waves className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">WaveOptics</h1>
            <p className="text-xs text-muted-foreground font-mono">
              Young's Double Slit Experiment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLoadDialogOpen(true)}
            className="hidden sm:flex"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Load Setup
          </Button>
          <Button
            size="sm"
            onClick={() => setIsSaveDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Controls Sidebar */}
        <aside className="w-full lg:w-96 border-r border-border bg-card/30 backdrop-blur-sm p-6 overflow-y-auto flex flex-col gap-8 z-10">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Beaker className="w-5 h-5 text-accent" />
                Parameters
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                title="Reset to defaults"
                className="h-8 w-8 hover:bg-white/5"
              >
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Wavelength Control */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="text-sm font-medium flex items-center gap-2 cursor-help">
                        Wavelength (λ)
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The distance between consecutive crests of a wave. Determines the color of light.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: formatWavelengthColor(wavelength), color: formatWavelengthColor(wavelength) }}
                  />
                  <span className="font-mono text-sm text-primary">{wavelength} nm</span>
                </div>
              </div>
              <Slider
                value={[wavelength]}
                min={380}
                max={750}
                step={1}
                onValueChange={(vals) => setWavelength(vals[0])}
                className="[&_.range]:bg-gradient-to-r [&_.range]:from-violet-500 [&_.range]:via-green-500 [&_.range]:to-red-500"
              />
            </div>

            <Separator className="bg-border/50" />

            {/* Separation Control */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="text-sm font-medium flex items-center gap-2 cursor-help">
                        Slit Separation (d)
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The distance between the two point sources of light.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-mono text-sm text-primary">{separation.toFixed(2)} mm</span>
              </div>
              <Slider
                value={[separation]}
                min={0.05}
                max={5.0}
                step={0.01}
                onValueChange={(vals) => setSeparation(vals[0])}
              />
            </div>

            <Separator className="bg-border/50" />

            {/* Distance Control */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="text-sm font-medium flex items-center gap-2 cursor-help">
                        Screen Distance (L)
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The distance from the light sources to the observation screen.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-mono text-sm text-primary">{distance} cm</span>
              </div>
              <Slider
                value={[distance]}
                min={10}
                max={200}
                step={1}
                onValueChange={(vals) => setDistance(vals[0])}
              />
            </div>
          </div>

          <Card className="bg-card/40 border-border/50 mt-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-accent" />
                Simulation Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground font-mono">
              <div className="flex justify-between">
                <span>Phase Diff:</span>
                <span className="text-foreground">Dynamic</span>
              </div>
              <div className="flex justify-between">
                <span>Sources:</span>
                <span className="text-foreground">2 (Coherent)</span>
              </div>
              <div className="mt-2 text-[10px] leading-tight opacity-70">
                Rendering interference pattern based on standard wave optics equations. 
                I ∝ cos²(δ/2)
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Canvas Area */}
        <div className="flex-1 p-4 lg:p-6 bg-black/90 relative flex flex-col">
          <div className="flex-1 rounded-xl overflow-hidden shadow-2xl shadow-primary/5 ring-1 ring-white/10 relative group">
            <InterferenceCanvas
              wavelength={wavelength}
              separation={separation}
              distance={distance}
            />
            
            {/* Ruler Overlay (Cosmetic) */}
            <div className="absolute bottom-4 left-4 right-4 h-6 border-t border-white/20 flex justify-between text-[10px] font-mono text-white/40 pt-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span>-10cm</span>
              <span>0</span>
              <span>+10cm</span>
            </div>
            <Ruler className="absolute top-4 left-4 w-5 h-5 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="mt-4 text-center text-xs text-muted-foreground font-mono">
            Interactive visualization: Adjust sliders to observe fringe width changes.
          </div>
        </div>
      </main>

      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px] glass-panel border-white/10">
          <DialogHeader>
            <DialogTitle>Save Configuration</DialogTitle>
            <DialogDescription>
              Give your experimental setup a name to retrieve it later.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experiment Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Double Slit Blue Light" {...field} className="bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createConfig.isPending}>
                  {createConfig.isPending ? "Saving..." : "Save Setup"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogContent className="sm:max-w-[550px] glass-panel border-white/10">
          <DialogHeader>
            <DialogTitle>Load Configuration</DialogTitle>
            <DialogDescription>
              Select a previously saved experiment setup.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[300px] w-full rounded-md border border-border/50 p-4">
            {isLoadingConfigs ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading...</div>
            ) : configurations?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-sm text-muted-foreground gap-2">
                <FolderOpen className="w-8 h-8 opacity-20" />
                No saved configurations found.
              </div>
            ) : (
              <div className="space-y-3">
                {configurations?.map((config: any) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/30 hover:border-primary/50 hover:bg-card/80 transition-all group"
                  >
                    <div className="flex flex-col gap-1 cursor-pointer flex-1" onClick={() => loadConfiguration(config)}>
                      <span className="font-medium text-sm">{config.name}</span>
                      <div className="flex gap-3 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: formatWavelengthColor(config.wavelength) }} />
                          λ={config.wavelength}nm
                        </span>
                        <span>d={config.separation}mm</span>
                        <span>L={config.distance}cm</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => deleteConfig.mutate(config.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
