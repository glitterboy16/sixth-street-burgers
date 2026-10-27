/** Tira de ajedrez roja. */
export default function Checker({ className = "" }: { className?: string }) {
  return <div className={`checker ${className}`} aria-hidden="true" />;
}
