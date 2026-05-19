import { useState } from 'react';

interface Props {
  onAdd: (name: string, color: string) => void;
  t: (key: string) => string;
}

const COLORS = [
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#f87171',
  '#a78bfa',
  '#f472b6',
];

export default function AddHabitForm({ onAdd, t }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    onAdd(trimmed, color);
    setName('');
    setColor(COLORS[0]);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={name}
          placeholder={t('habit_name') || 'Habit name'}
          onChange={(e) => setName(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '10px',
            border: '1px solid #ccc',
          }}
        />

        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '10px' }}
        >
          {COLORS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          type="submit"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: '#111',
            color: '#fff',
          }}
        >
          +
        </button>
      </div>
    </form>
  );
}