export default function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-h2" style={{
      color: 'var(--color-ink)',
      textAlign: 'right',
      fontSize: '25px',
      marginBottom: '10px',
      marginTop: '-23px',
      marginRight: '10px'
    }}>
      {title}
    </h2>
  );
}
