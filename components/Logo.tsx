const RKLibraryLogo = () => (
  <svg
    width="200"
    height="60"
    viewBox="0 0 200 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Abstract Book/Management Icon */}
    <rect x="10" y="15" width="40" height="30" rx="4" fill="#1E40AF" />
    <path d="M30 15V45" stroke="white" strokeWidth="2" strokeDasharray="4 2" />
    <circle cx="42" cy="22" r="6" fill="#10B981" />
    <path d="M39 22L41 24L45 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

    {/* Text Element */}
    <text x="60" y="38" fill="#1E293B" style={{ font: "bold 24px sans-serif" }}>
      RK
    </text>
    <text x="95" y="38" fill="#64748B" style={{ font: "24px sans-serif" }}>
      LIBRARY
    </text>
  </svg>
);


export default RKLibraryLogo;