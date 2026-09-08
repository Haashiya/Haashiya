export default function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-h2" style={{
      color: 'var(--color-ink)',
      textAlign: 'center',
      marginBottom: '16px'
    }}>
      {title}
    </h2>
  );
}
