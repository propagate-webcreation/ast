import Image from "next/image";

const HEADER_IMAGE =
  "/directors-bot-uploads/6be98e49-e1b8-42b1-9257-78f6c9ce44ca/1790734848920-2ebe9w-00-hedda-_あすと.png";

export default function HomeHeader() {
  return (
    <header className="w-full">
      <Image
        src={HEADER_IMAGE}
        alt="李琳中国語講座"
        width={1200}
        height={200}
        className="w-full h-auto"
        priority
      />
    </header>
  );
}
