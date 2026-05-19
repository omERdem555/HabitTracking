import { useState } from 'react';
import ColorPicker from './ColorPicker';

interface Props {
  onAdd: (name: string, color: string) => void;
  t: (key: string) => string;
}

export default function AddHabitForm({ onAdd, t }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#60a5fa');
  const [colorOpen, setColorOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    onAdd(trimmed, color);

    setName('');
    setColor('#60a5fa');
    setColorOpen(false);
  };

  return (
    <section
      style={{
        padding: '1rem',
        borderRadius: '16px',
        background: 'var(--card-bg)',
        border: '1px solid rgba(148,163,184,0.2)',
        marginBottom: '1rem',
        position: 'relative',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
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

        {/* COLOR BUTTON */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setColorOpen((v) => !v)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: color,
              cursor: 'pointer',
              border: '1px solid rgba(148,163,184,0.4)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            }}
          />

          {colorOpen && (
            <div
              style={{
                position: 'absolute',
                top: '45px',
                zIndex: 50,
                background: 'var(--card-bg)',
                border: '1px solid rgba(148,163,184,0.25)',
                borderRadius: '12px',
                padding: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              }}
            >
              <ColorPicker
                value={color}
                onChange={setColor}
              />
            </div>
          )}
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