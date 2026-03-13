export default function TellLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 90 90"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <rect width="90" height="90" rx="16" fill="#0C0F26" />
      <rect x="15" y="28" width="60" height="16" rx="8" fill="#F5A623" />
      <polygon points="45,44 39,72 45,78 51,72" fill="#F5A623" />
    </svg>
  )
}
