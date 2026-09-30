const HEADER_IMAGE =
  "/directors-bot-uploads/6be98e49-e1b8-42b1-9257-78f6c9ce44ca/1790737363432-zukvbj-00-header-slim.png";

export default function HomeHeader() {
  return (
    <header className="w-full">
      <img src={HEADER_IMAGE} alt="" className="w-full h-auto block" />
    </header>
  );
}
