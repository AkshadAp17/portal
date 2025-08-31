import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BollingerBandsSettings } from '@/lib/types';

interface BollingerSettingsProps {
  settings: BollingerBandsSettings;
  onSettingsChange: (settings: BollingerBandsSettings) => void;
  onClose: () => void;
}

export default function BollingerSettings({ settings, onSettingsChange, onClose }: BollingerSettingsProps) {
  const [localSettings, setLocalSettings] = useState<BollingerBandsSettings>(settings);

  const updateSetting = <K extends keyof BollingerBandsSettings>(
    key: K,
    value: BollingerBandsSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    const defaults: BollingerBandsSettings = {
      length: 20,
      maType: 'sma',
      source: 'close',
      stddev: 2,
      offset: 0,
      basicVisible: true,
      basicColor: '#f7c52d',
      basicWidth: 1,
      basicStyle: 'solid',
      upperVisible: true,
      upperColor: '#2962ff',
      upperWidth: 1,
      upperStyle: 'solid',
      lowerVisible: true,
      lowerColor: '#c84bc7',
      lowerWidth: 1,
      lowerStyle: 'solid',
      fillVisible: true,
      fillOpacity: 10
    };
    setLocalSettings(defaults);
    onSettingsChange(defaults);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden" data-testid="dialog-bollinger-settings">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">Bollinger Bands Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="inputs" className="w-full">
          <TabsList className="grid w-full grid-cols-2" data-testid="tabs-settings">
            <TabsTrigger value="inputs" data-testid="tab-inputs">Inputs</TabsTrigger>
            <TabsTrigger value="style" data-testid="tab-style">Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inputs" className="space-y-6 max-h-96 overflow-y-auto p-1" data-testid="content-inputs">
            <div className="space-y-4">
              <div>
                <Label htmlFor="length" className="text-sm font-medium">Length</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <Slider
                    value={[localSettings.length]}
                    onValueChange={(value) => updateSetting('length', value[0])}
                    min={5}
                    max={50}
                    step={1}
                    className="flex-1"
                    data-testid="slider-length"
                  />
                  <Input
                    type="number"
                    value={localSettings.length}
                    onChange={(e) => updateSetting('length', parseInt(e.target.value))}
                    min={5}
                    max={50}
                    className="w-16 text-center"
                    data-testid="input-length"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Number of periods for moving average calculation</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Basic MA Type</Label>
                <Select value={localSettings.maType} onValueChange={(value) => updateSetting('maType', value as 'sma')}>
                  <SelectTrigger className="mt-2" data-testid="select-ma-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sma">SMA (Simple Moving Average)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Source</Label>
                <Select value={localSettings.source} onValueChange={(value) => updateSetting('source', value as any)}>
                  <SelectTrigger className="mt-2" data-testid="select-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="close">Close</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="hl2">HL2 ((High + Low) / 2)</SelectItem>
                    <SelectItem value="hlc3">HLC3 ((High + Low + Close) / 3)</SelectItem>
                    <SelectItem value="ohlc4">OHLC4 ((Open + High + Low + Close) / 4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">StdDev (Multiplier)</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <Slider
                    value={[localSettings.stddev]}
                    onValueChange={(value) => updateSetting('stddev', value[0])}
                    min={0.5}
                    max={5}
                    step={0.1}
                    className="flex-1"
                    data-testid="slider-stddev"
                  />
                  <Input
                    type="number"
                    value={localSettings.stddev}
                    onChange={(e) => updateSetting('stddev', parseFloat(e.target.value))}
                    min={0.5}
                    max={5}
                    step={0.1}
                    className="w-20 text-center"
                    data-testid="input-stddev"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Standard deviation multiplier for band calculation</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Offset</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <Slider
                    value={[localSettings.offset]}
                    onValueChange={(value) => updateSetting('offset', value[0])}
                    min={-20}
                    max={20}
                    step={1}
                    className="flex-1"
                    data-testid="slider-offset"
                  />
                  <Input
                    type="number"
                    value={localSettings.offset}
                    onChange={(e) => updateSetting('offset', parseInt(e.target.value))}
                    min={-20}
                    max={20}
                    className="w-16 text-center"
                    data-testid="input-offset"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Shift bands by N bars (positive = forward, negative = backward)</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="style" className="space-y-6 max-h-96 overflow-y-auto p-1" data-testid="content-style">
            {/* Basic (Middle Band) */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b border-border pb-2">Basic (Middle Band)</h3>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Visibility</Label>
                <Switch
                  checked={localSettings.basicVisible}
                  onCheckedChange={(checked) => updateSetting('basicVisible', checked)}
                  data-testid="switch-basic-visible"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Color</Label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-5 h-5 rounded border border-border"
                    style={{ backgroundColor: localSettings.basicColor }}
                  />
                  <input
                    type="color"
                    value={localSettings.basicColor}
                    onChange={(e) => updateSetting('basicColor', e.target.value)}
                    className="w-8 h-8 border-none rounded cursor-pointer"
                    data-testid="input-basic-color"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Line Width</Label>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[localSettings.basicWidth]}
                    onValueChange={(value) => updateSetting('basicWidth', value[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="w-24"
                    data-testid="slider-basic-width"
                  />
                  <span className="text-sm w-6">{localSettings.basicWidth}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Line Style</Label>
                <Select value={localSettings.basicStyle} onValueChange={(value) => updateSetting('basicStyle', value as 'solid' | 'dashed')}>
                  <SelectTrigger className="w-32" data-testid="select-basic-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Upper Band */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b border-border pb-2">Upper Band</h3>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Visibility</Label>
                <Switch
                  checked={localSettings.upperVisible}
                  onCheckedChange={(checked) => updateSetting('upperVisible', checked)}
                  data-testid="switch-upper-visible"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Color</Label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-5 h-5 rounded border border-border"
                    style={{ backgroundColor: localSettings.upperColor }}
                  />
                  <input
                    type="color"
                    value={localSettings.upperColor}
                    onChange={(e) => updateSetting('upperColor', e.target.value)}
                    className="w-8 h-8 border-none rounded cursor-pointer"
                    data-testid="input-upper-color"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Line Width</Label>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[localSettings.upperWidth]}
                    onValueChange={(value) => updateSetting('upperWidth', value[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="w-24"
                    data-testid="slider-upper-width"
                  />
                  <span className="text-sm w-6">{localSettings.upperWidth}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Line Style</Label>
                <Select value={localSettings.upperStyle} onValueChange={(value) => updateSetting('upperStyle', value as 'solid' | 'dashed')}>
                  <SelectTrigger className="w-32" data-testid="select-upper-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Lower Band */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b border-border pb-2">Lower Band</h3>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Visibility</Label>
                <Switch
                  checked={localSettings.lowerVisible}
                  onCheckedChange={(checked) => updateSetting('lowerVisible', checked)}
                  data-testid="switch-lower-visible"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Color</Label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-5 h-5 rounded border border-border"
                    style={{ backgroundColor: localSettings.lowerColor }}
                  />
                  <input
                    type="color"
                    value={localSettings.lowerColor}
                    onChange={(e) => updateSetting('lowerColor', e.target.value)}
                    className="w-8 h-8 border-none rounded cursor-pointer"
                    data-testid="input-lower-color"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Line Width</Label>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[localSettings.lowerWidth]}
                    onValueChange={(value) => updateSetting('lowerWidth', value[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="w-24"
                    data-testid="slider-lower-width"
                  />
                  <span className="text-sm w-6">{localSettings.lowerWidth}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Line Style</Label>
                <Select value={localSettings.lowerStyle} onValueChange={(value) => updateSetting('lowerStyle', value as 'solid' | 'dashed')}>
                  <SelectTrigger className="w-32" data-testid="select-lower-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Background Fill */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b border-border pb-2">Background Fill</h3>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Visibility</Label>
                <Switch
                  checked={localSettings.fillVisible}
                  onCheckedChange={(checked) => updateSetting('fillVisible', checked)}
                  data-testid="switch-fill-visible"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Opacity</Label>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[localSettings.fillOpacity]}
                    onValueChange={(value) => updateSetting('fillOpacity', value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-24"
                    data-testid="slider-fill-opacity"
                  />
                  <span className="text-sm w-8">{localSettings.fillOpacity}%</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button 
            variant="ghost" 
            onClick={resetToDefaults}
            className="text-sm text-muted-foreground hover:text-foreground"
            data-testid="button-reset-defaults"
          >
            Reset to Defaults
          </Button>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid="button-apply"
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
