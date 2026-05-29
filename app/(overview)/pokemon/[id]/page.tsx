import { ViewTransition } from "react";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  return (
    <ViewTransition name={`pokemon-card-${id}`}>
      <div>detail</div>
    </ViewTransition>
  );
}
