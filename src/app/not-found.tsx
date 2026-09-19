import Link from "next/link";
import { Terminal } from "@/components/Terminal";

export default function NotFound() {
  return (
    <div className="frame grid grid-cols-12 gap-x-3 gap-y-8 md:gap-8 py-20">
      <h1 className="display col-span-12 text-[clamp(6rem,24vw,20rem)] md:col-span-7">404</h1>
      <div className="col-span-12 self-end md:col-span-5">
        <Terminal
          command="cd ./esta-pagina"
          lines={[
            { key: "error", value: <span className="text-accent-ink">no such file or directory</span> },
            { key: "try", value: <Link href="/work" className="link">/work</Link> },
            { key: "or", value: <Link href="/" className="link">/</Link> },
          ]}
        />
      </div>
    </div>
  );
}
