const HEADER_IMAGE =
  "/directors-bot-uploads/6be98e49-e1b8-42b1-9257-78f6c9ce44ca/1790765786632-9xefwr-00-header-safe-margin.png";

export default function HomeHeader() {
  return (
    <header className="w-full sticky top-0 z-50">
      <img src={HEADER_IMAGE} alt="" className="w-full h-auto block" />
    </header>
  );
}
