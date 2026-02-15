import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MousePointer, Pencil, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import type { Level, Hazard } from '@/types';

interface HotspotEditorProps {
  level: Level;
  onSave: (hazards: Omit<Hazard, 'id'>[]) => void;
  onCancel: () => void;
}

interface EditorHazard {
  tempId: string;
  level_id: string;
  group_key: string;
  name: string;
  description: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

type Mode = 'select' | 'draw';
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null;

export function HotspotEditor({ level, onSave, onCancel }: HotspotEditorProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [mode, setMode] = useState<Mode>('select');
  const [hazards, setHazards] = useState<EditorHazard[]>(() =>
    (level.hazards || []).map((h, i) => ({
      tempId: `existing-${i}`,
      level_id: level.id,
      group_key: h.group_key,
      name: h.name,
      description: h.description,
      x: h.x,
      y: h.y,
      w: h.w,
      h: h.h,
    })),
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Drawing state
  const drawingRef = useRef(false);
  const drawStartRef = useRef({ nx: 0, ny: 0 });
  const [drawPreview, setDrawPreview] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Dragging state
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ nx: 0, ny: 0, origX: 0, origY: 0 });

  // Resize state
  const resizingRef = useRef<ResizeHandle>(null);
  const resizeStartRef = useRef({ nx: 0, ny: 0, origX: 0, origY: 0, origW: 0, origH: 0 });

  const nextIdRef = useRef(0);

  const recalcOffset = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return;
    const imgRect = imgRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setImageOffset({
      x: imgRect.left - containerRect.left,
      y: imgRect.top - containerRect.top,
      width: imgRect.width,
      height: imgRect.height,
    });
  }, []);

  useEffect(() => {
    recalcOffset();
    window.addEventListener('resize', recalcOffset);
    return () => window.removeEventListener('resize', recalcOffset);
  }, [recalcOffset]);

  const pixelToNorm = useCallback((px: number, py: number) => {
    return {
      nx: (px - imageOffset.x) / imageOffset.width,
      ny: (py - imageOffset.y) / imageOffset.height,
    };
  }, [imageOffset]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { nx, ny } = pixelToNorm(px, py);

    if (mode === 'draw') {
      drawingRef.current = true;
      drawStartRef.current = { nx, ny };
      setDrawPreview({ x: nx, y: ny, w: 0, h: 0 });
    }
  }, [mode, pixelToNorm]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { nx, ny } = pixelToNorm(px, py);

    if (drawingRef.current) {
      const sx = drawStartRef.current.nx;
      const sy = drawStartRef.current.ny;
      setDrawPreview({
        x: Math.min(sx, nx),
        y: Math.min(sy, ny),
        w: Math.abs(nx - sx),
        h: Math.abs(ny - sy),
      });
    }

    if (draggingRef.current && selectedIndex !== null) {
      const dx = nx - dragStartRef.current.nx;
      const dy = ny - dragStartRef.current.ny;
      setHazards((prev) =>
        prev.map((h, i) =>
          i === selectedIndex
            ? { ...h, x: Math.max(0, Math.min(1 - h.w, dragStartRef.current.origX + dx)), y: Math.max(0, Math.min(1 - h.h, dragStartRef.current.origY + dy)) }
            : h,
        ),
      );
    }

    if (resizingRef.current && selectedIndex !== null) {
      const handle = resizingRef.current;
      const { origX, origY, origW, origH, nx: snx, ny: sny } = resizeStartRef.current;
      const dx = nx - snx;
      const dy = ny - sny;

      let newX = origX, newY = origY, newW = origW, newH = origH;
      if (handle === 'se') { newW = origW + dx; newH = origH + dy; }
      if (handle === 'sw') { newX = origX + dx; newW = origW - dx; newH = origH + dy; }
      if (handle === 'ne') { newY = origY + dy; newW = origW + dx; newH = origH - dy; }
      if (handle === 'nw') { newX = origX + dx; newY = origY + dy; newW = origW - dx; newH = origH - dy; }

      if (newW < 0.01) newW = 0.01;
      if (newH < 0.01) newH = 0.01;
      newX = Math.max(0, Math.min(1 - newW, newX));
      newY = Math.max(0, Math.min(1 - newH, newY));

      setHazards((prev) =>
        prev.map((h, i) => (i === selectedIndex ? { ...h, x: newX, y: newY, w: newW, h: newH } : h)),
      );
    }
  }, [pixelToNorm, selectedIndex]);

  const handleMouseUp = useCallback(() => {
    if (drawingRef.current && drawPreview) {
      drawingRef.current = false;
      if (drawPreview.w > 0.005 && drawPreview.h > 0.005) {
        const newHazard: EditorHazard = {
          tempId: `new-${nextIdRef.current++}`,
          level_id: level.id,
          group_key: `group_${hazards.length + 1}`,
          name: `Risk ${hazards.length + 1}`,
          description: '',
          x: drawPreview.x,
          y: drawPreview.y,
          w: drawPreview.w,
          h: drawPreview.h,
        };
        setHazards((prev) => [...prev, newHazard]);
        setSelectedIndex(hazards.length);
        setMode('select');
      }
      setDrawPreview(null);
    }
    draggingRef.current = false;
    resizingRef.current = null;
  }, [drawPreview, hazards.length, level.id]);

  const handleHazardMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    if (mode !== 'select') return;
    e.stopPropagation();
    setSelectedIndex(index);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { nx, ny } = pixelToNorm(px, py);

    draggingRef.current = true;
    dragStartRef.current = {
      nx, ny,
      origX: hazards[index].x,
      origY: hazards[index].y,
    };
  }, [mode, hazards, pixelToNorm]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    if (!handle || selectedIndex === null) return;
    e.stopPropagation();
    resizingRef.current = handle;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { nx, ny } = pixelToNorm(px, py);

    const h = hazards[selectedIndex];
    resizeStartRef.current = {
      nx, ny,
      origX: h.x, origY: h.y,
      origW: h.w, origH: h.h,
    };
  }, [selectedIndex, hazards, pixelToNorm]);

  const removeHazard = useCallback((index: number) => {
    setHazards((prev) => prev.filter((_, i) => i !== index));
    setSelectedIndex(null);
  }, []);

  const addHazardManually = useCallback(() => {
    const newHazard: EditorHazard = {
      tempId: `new-${nextIdRef.current++}`,
      level_id: level.id,
      group_key: `group_${hazards.length + 1}`,
      name: `Risk ${hazards.length + 1}`,
      description: '',
      x: 0.3,
      y: 0.3,
      w: 0.1,
      h: 0.1,
    };
    setHazards((prev) => [...prev, newHazard]);
    setSelectedIndex(hazards.length);
  }, [hazards.length, level.id]);

  const handleSave = useCallback(() => {
    onSave(
      hazards.map(({ level_id, group_key, name, description, x, y, w, h }) => ({
        level_id,
        group_key,
        name,
        description,
        x,
        y,
        w,
        h,
      })),
    );
  }, [hazards, onSave]);

  const selected = selectedIndex !== null ? hazards[selectedIndex] : null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={onCancel} className="font-heading gap-1.5">
          <ArrowLeft size={16} />
          {t('common.back')}
        </Button>

        <div className="flex gap-1 border rounded-md p-0.5">
          <Button
            variant={mode === 'select' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('select')}
            className="font-heading gap-1"
          >
            <MousePointer size={14} />
            {t('admin.selectMode')}
          </Button>
          <Button
            variant={mode === 'draw' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('draw')}
            className="font-heading gap-1"
          >
            <Pencil size={14} />
            {t('admin.drawMode')}
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={addHazardManually} className="font-heading gap-1">
          <Plus size={14} />
          {t('admin.addHazard')}
        </Button>

        <div className="ml-auto">
          <Button
            onClick={handleSave}
            className="bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading font-semibold gap-1.5"
            size="sm"
          >
            <Save size={16} />
            {t('admin.saveHazards')}
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Image + hotspots */}
        <div
          ref={containerRef}
          className="relative flex-1 bg-neutral-900 rounded-lg overflow-hidden select-none"
          style={{ cursor: mode === 'draw' ? 'crosshair' : 'default', minHeight: 400 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imgRef}
            src={level.image_path}
            alt={level.name}
            className="w-full h-auto"
            onLoad={recalcOffset}
            draggable={false}
          />

          {/* Hazard rectangles */}
          {hazards.map((h, i) => {
            const isSelected = i === selectedIndex;
            return (
              <div
                key={h.tempId}
                onMouseDown={(e) => handleHazardMouseDown(e, i)}
                style={{
                  position: 'absolute',
                  left: imageOffset.x + h.x * imageOffset.width,
                  top: imageOffset.y + h.y * imageOffset.height,
                  width: h.w * imageOffset.width,
                  height: h.h * imageOffset.height,
                  border: isSelected ? '2px solid #3B82F6' : '2px dashed #EF4444',
                  backgroundColor: isSelected ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.1)',
                  cursor: mode === 'select' ? 'move' : 'crosshair',
                }}
              >
                {/* Label */}
                <span
                  className="absolute -top-5 left-0 text-xs px-1 rounded font-heading truncate max-w-[120px]"
                  style={{
                    backgroundColor: isSelected ? '#3B82F6' : '#EF4444',
                    color: 'white',
                  }}
                >
                  {h.group_key}
                </span>

                {/* Resize handles */}
                {isSelected && mode === 'select' && (
                  <>
                    {(['nw', 'ne', 'sw', 'se'] as const).map((handle) => (
                      <div
                        key={handle}
                        onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                        style={{
                          position: 'absolute',
                          width: 10,
                          height: 10,
                          backgroundColor: '#3B82F6',
                          border: '1px solid white',
                          ...(handle.includes('n') ? { top: -5 } : { bottom: -5 }),
                          ...(handle.includes('w') ? { left: -5 } : { right: -5 }),
                          cursor: handle === 'nw' || handle === 'se' ? 'nwse-resize' : 'nesw-resize',
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            );
          })}

          {/* Draw preview */}
          {drawPreview && (
            <div
              style={{
                position: 'absolute',
                left: imageOffset.x + drawPreview.x * imageOffset.width,
                top: imageOffset.y + drawPreview.y * imageOffset.height,
                width: drawPreview.w * imageOffset.width,
                height: drawPreview.h * imageOffset.height,
                border: '2px solid #3B82F6',
                backgroundColor: 'rgba(59,130,246,0.2)',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        {/* Properties panel */}
        <Card className="w-72 shrink-0 border-brand-gold-soft">
          <CardContent className="p-3 space-y-3">
            {selected ? (
              <>
                <div className="space-y-1">
                  <Label className="font-heading text-xs">{t('admin.hazardGroup')}</Label>
                  <Input
                    value={selected.group_key}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHazards((prev) => prev.map((h, i) => (i === selectedIndex ? { ...h, group_key: val } : h)));
                    }}
                    className="font-body text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-heading text-xs">{t('admin.hazardName')}</Label>
                  <Input
                    value={selected.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHazards((prev) => prev.map((h, i) => (i === selectedIndex ? { ...h, name: val } : h)));
                    }}
                    className="font-body text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-heading text-xs">{t('admin.hazardDescription')}</Label>
                  <Textarea
                    value={selected.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHazards((prev) => prev.map((h, i) => (i === selectedIndex ? { ...h, description: val } : h)));
                    }}
                    className="font-body text-sm min-h-[60px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <Label className="font-heading text-xs">X</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={selected.x.toFixed(3)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setHazards((prev) => prev.map((h, i) => (i === selectedIndex ? { ...h, x: val } : h)));
                      }}
                      className="font-body text-xs h-7"
                    />
                  </div>
                  <div>
                    <Label className="font-heading text-xs">Y</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={selected.y.toFixed(3)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setHazards((prev) => prev.map((h, i) => (i === selectedIndex ? { ...h, y: val } : h)));
                      }}
                      className="font-body text-xs h-7"
                    />
                  </div>
                  <div>
                    <Label className="font-heading text-xs">W</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={selected.w.toFixed(3)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setHazards((prev) => prev.map((h, i) => (i === selectedIndex ? { ...h, w: val } : h)));
                      }}
                      className="font-body text-xs h-7"
                    />
                  </div>
                  <div>
                    <Label className="font-heading text-xs">H</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={selected.h.toFixed(3)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setHazards((prev) => prev.map((h, i) => (i === selectedIndex ? { ...h, h: val } : h)));
                      }}
                      className="font-body text-xs h-7"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeHazard(selectedIndex!)}
                  className="w-full text-game-danger hover:text-game-danger font-heading gap-1"
                >
                  <Trash2 size={14} />
                  {t('common.delete')}
                </Button>
              </>
            ) : (
              <p className="text-center font-body text-sm text-brand-dark/50">
                {mode === 'draw' ? t('admin.drawMode') : t('admin.selectMode')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
