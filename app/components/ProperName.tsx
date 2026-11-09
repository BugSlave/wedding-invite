/**
 * Renders a name with a slightly larger first letter on every word.
 * The calligraphy font draws capitals only a little bigger than lowercase,
 * so "Arora" can read like "arora"; this makes the capital unmistakable.
 */
export default function ProperName({ name }: { name: string }) {
  return (
    <>
      {name.split(" ").map((word, i) => (
        <span key={i}>
          {i > 0 ? " " : ""}
          <span style={{ fontSize: "1.18em", lineHeight: 0 }}>{word.charAt(0)}</span>
          {word.slice(1)}
        </span>
      ))}
    </>
  );
}
