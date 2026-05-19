import { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
};

export default function ColorPicker({
  value,
  onChange,
  onClose,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hue, setHue] = useState(210);

  const draw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    const white = ctx.createLinearGradient(0, 0, width, 0);

    white.addColorStop(0, 'rgba(255,255,255,1)');
    white.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = white;
    ctx.fillRect(0, 0, width, height);

    const black = ctx.createLinearGradient(0, 0, 0, height);

    black.addColorStop(0, 'rgba(0,0,0,0)');
    black.addColorStop(1, 'rgba(0,0,0,1)');

    ctx.fillStyle = black;
    ctx.fillRect(0, 0, width, height);
  };

  const resizeAndDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const width = 260;
    const height = 150;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    draw(ctx, width, height);
  };

  useEffect(() => {
    resizeAndDraw();
  }, [hue]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

    const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const pixel = ctx.getImageData(x, y, 1, 1).data;

    const hex =
        '#' +
        [pixel[0], pixel[1], pixel[2]]
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('');

    onChange(hex);
    };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)',
          padding: 16,
          borderRadius: 18,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          width: 'fit-content',
          maxWidth: '90vw',
          border: '1px solid rgba(148,163,184,0.2)',
        }}
      >
        {/* PREVIEW */}
        <div
          style={{
            width: '100%',
            height: 32,
            borderRadius: 10,
            background: value,
            marginBottom: 14,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />

        {/* HUE */}
        <input
          type="range"
          min={0}
          max={360}
          value={hue}
          onChange={(e) => setHue(Number(e.target.value))}
          style={{
            width: '100%',
            marginBottom: 12,
          }}
        />

        {/* CANVAS */}
        <canvas
          ref={canvasRef}
          onClick={pickColor}
          style={{
            borderRadius: 12,
            cursor: 'crosshair',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}