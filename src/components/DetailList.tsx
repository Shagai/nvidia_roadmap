export function DetailList({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <div className="detail-list">
      <h4>{title}</h4>
      <ListTag>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
}
