import { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (color: string) => void;
};

export default function ColorPicker({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [hue, setHue] = useState(210);

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // base hue
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    // white gradient
    const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);

    // black gradient
    const blackGrad = ctx.createLinearGradient(0, 0, 0, height);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, width, height);
  };

  const resizeAndDraw = () => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const width = Math.min(wrapper.offsetWidth, 280); // mobile limit
    const height = 140;

    // physical size
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // display size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    draw(ctx, width, height);
  };

  useEffect(() => {
    resizeAndDraw();
    window.addEventListener('resize', resizeAndDraw);
    return () => window.removeEventListener('resize', resizeAndDraw);
  }, [hue]);

  const pickColor = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
      ref={wrapperRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: '100%',
        maxWidth: 280,
      }}
    >
      <input
        type="range"
        min={0}
        max={360}
        value={hue}
        onChange={(e) => setHue(Number(e.target.value))}
        style={{ width: '100%' }}
      />

      <canvas
        ref={canvasRef}
        onClick={pickColor}
        style={{
          borderRadius: 10,
          cursor: 'crosshair',
          width: '100%',
          touchAction: 'none',
        }}
      />
    </div>
  );
}