import { useEffect, useRef, useState } from 'react';

interface AvatarCropProps {
  file: File;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

const SIZE = 300; // output px (square)

export default function AvatarCrop({ file, onConfirm, onCancel }: AvatarCropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const objectUrlRef = useRef('');

  // crop state: cx/cy = center of crop in image coords, scale = displayed scale
  const [imgSize, setImgSize] = useState({ w: 1, h: 1 });
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 1 }); // in image coords
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // display canvas size
  const CANVAS = 400;

  useEffect(() => {
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setImgSize({ w, h });
      const size = Math.min(w, h);
      setCrop({ x: (w - size) / 2, y: (h - size) / 2, size });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // draw onto display canvas whenever crop changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || imgSize.w === 1) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = CANVAS;
    canvas.height = CANVAS;

    // scale factor: image → canvas
    const scale = CANVAS / imgSize.w;
    const scaledH = imgSize.h * scale;

    // draw image
    ctx.clearRect(0, 0, CANVAS, CANVAS);
    ctx.drawImage(img, 0, 0, CANVAS, scaledH);

    // dim overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS, scaledH);

    // clear circle
    const cx = (crop.x + crop.size / 2) * scale;
    const cy = (crop.y + crop.size / 2) * scale;
    const r = (crop.size / 2) * scale;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0, CANVAS, scaledH);
    ctx.restore();

    // circle border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // preview
    const prev = previewRef.current;
    if (prev) {
      prev.width = 80;
      prev.height = 80;
      const pc = prev.getContext('2d')!;
      pc.beginPath();
      pc.arc(40, 40, 40, 0, Math.PI * 2);
      pc.clip();
      pc.drawImage(img, crop.x, crop.y, crop.size, crop.size, 0, 0, 80, 80);
    }
  }, [crop, imgSize]);

  const imgToCanvas = (imgX: number, imgY: number) => ({
    cx: imgX * (CANVAS / imgSize.w),
    cy: imgY * (imgSize.h === 1 ? 1 : CANVAS / imgSize.w),
  });

  const canvasToImg = (cx: number, cy: number) => ({
    x: cx / (CANVAS / imgSize.w),
    y: cy / (CANVAS / imgSize.w),
  });

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    const scale = imgSize.w / CANVAS;
    setCrop(c => {
      const nx = Math.max(0, Math.min(c.x + dx * scale, imgSize.w - c.size));
      const ny = Math.max(0, Math.min(c.y + dy * scale, imgSize.h - c.size));
      return { ...c, x: nx, y: ny };
    });
  };

  const onMouseUp = () => { dragging.current = false; };

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setCrop(c => {
      const minSize = Math.min(imgSize.w, imgSize.h) * 0.2;
      const maxSize = Math.min(imgSize.w, imgSize.h);
      const ns = Math.max(minSize, Math.min(c.size * delta, maxSize));
      // keep center
      const cx = c.x + c.size / 2;
      const cy = c.y + c.size / 2;
      const nx = Math.max(0, Math.min(cx - ns / 2, imgSize.w - ns));
      const ny = Math.max(0, Math.min(cy - ns / 2, imgSize.h - ns));
      return { x: nx, y: ny, size: ns };
    });
  };

  // touch support
  const lastTouch = useRef({ x: 0, y: 0 });
  const onTouchStart = (e: React.TouchEvent) => {
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const dx = e.touches[0].clientX - lastTouch.current.x;
    const dy = e.touches[0].clientY - lastTouch.current.y;
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const scale = imgSize.w / CANVAS;
    setCrop(c => {
      const nx = Math.max(0, Math.min(c.x + dx * scale, imgSize.w - c.size));
      const ny = Math.max(0, Math.min(c.y + dy * scale, imgSize.h - c.size));
      return { ...c, x: nx, y: ny };
    });
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;
    const out = document.createElement('canvas');
    out.width = SIZE;
    out.height = SIZE;
    const ctx = out.getContext('2d')!;
    ctx.drawImage(img, crop.x, crop.y, crop.size, crop.size, 0, 0, SIZE, SIZE);
    out.toBlob(
      blob => { if (blob) onConfirm(blob); },
      'image/webp',
      0.88,
    );
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16,
        padding: '1.5rem', maxWidth: 480, width: '95vw',
        display: 'flex', flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111' }}>Profil Fotoğrafını Kırp</h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.25rem' }}>✕</button>
        </div>

        <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5 }}>
          Daireyi sürükleyerek konumlandırın. Fare tekerleğiyle veya parmak hareketiyle boyutlandırın.
        </p>

        <canvas
          ref={canvasRef}
          width={CANVAS}
          height={CANVAS}
          style={{ width: '100%', borderRadius: 10, cursor: 'move', touchAction: 'none', userSelect: 'none' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onMouseUp}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <canvas
              ref={previewRef}
              width={80}
              height={80}
              style={{ borderRadius: '50%', border: '2px solid #e5e7eb' }}
            />
            <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Önizleme</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
              Görsel <strong>WebP</strong> formatına dönüştürülerek yüklenecek.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.55rem 1.25rem', border: '1px solid #e5e7eb',
              borderRadius: 8, background: '#fff', color: '#374151',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '0.55rem 1.25rem', border: 'none',
              borderRadius: 8, background: '#111', color: '#fff',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Uygula
          </button>
        </div>
      </div>
    </div>
  );
}
