import { useState } from 'react';

interface Props {
  onAdd: (name: string, color: string) => void;
  t: (key: string) => string;
}

const getColorFromHue = (hue: number) => `hsl(${hue}, 70%, 55%)`;

export default function AddHabitForm({ onAdd, t }: Props) {
  const [name, setName] = useState('');
  const [hue, setHue] = useState(210);

  const color = getColorFromHue(hue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    onAdd(trimmed, color);

    setName('');
    setHue(210);
  };

  return (
    <section
      style={{
        padding: '1rem',
        borderRadius: '16px',
        background: 'var(--card-bg)',
        border: '1px solid rgba(148,163,184,0.2)',
        marginBottom: '1rem',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        
        {/* INPUT */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('addHabitPlaceholder')}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: '1px solid rgba(148,163,184,0.35)',
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
          }}
        />

        {/* COLOR SLIDER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <input
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            style={{ width: '140px' }}
          />

          <div
            style={{
              width: '100%',
              height: '10px',
              borderRadius: '6px',
              background: color,
              transition: '0.2s',
            }}
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          style={{
            padding: '0.85rem 1.2rem',
            borderRadius: '12px',
            border: 'none',
            background: color,
            color: '#fff',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </form>
    </section>
  );
}