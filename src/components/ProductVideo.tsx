import { videoEmbed } from "@/lib/product-specs";

/** Renders the product video (YouTube/Vimeo embed or an uploaded file). Nothing when there is none. */
export default function ProductVideo({ url, className = "" }: { url?: string; className?: string }) {
  const embed = videoEmbed(url);
  if (!embed) return null;
  return (
    <div className={`aspect-video w-full overflow-hidden bg-black ${className}`}>
      {embed.kind === "iframe" ? (
        <iframe
          src={embed.src}
          title="Product video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video src={embed.src} controls preload="metadata" className="w-full h-full" />
      )}
    </div>
  );
}
