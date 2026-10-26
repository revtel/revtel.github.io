export function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <svg className="orbit" viewBox="0 0 600 600" fill="none">
        <defs>
          <linearGradient id="brand-flow" x1="40" y1="500" x2="530" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFB65C" /><stop offset=".38" stopColor="#FF7854" />
            <stop offset=".65" stopColor="#ED69A3" /><stop offset="1" stopColor="#9561CF" />
          </linearGradient>
        </defs>
        <path d="M-30 447C61 367 76 94 292 92C498 90 589 272 481 426C376 576 138 533 135 369C132 223 335 173 449 273C548 361 513 544 632 507" stroke="url(#brand-flow)" strokeWidth="24" strokeLinecap="round" />
        <path d="M-22 470C80 390 102 132 290 129C456 126 548 275 450 407C365 522 182 498 174 371C167 253 323 220 413 293C500 365 479 519 610 540" stroke="url(#brand-flow)" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
        <circle cx="470" cy="124" r="10" fill="#EE69A3" />
        <circle cx="76" cy="288" r="7" fill="#FFAA52" />
        <circle cx="449" cy="541" r="7" fill="#9561CF" />
      </svg>
      <div className="logo-island"><img src="/logos/logo-revtel.png" alt="" width="260" height="260" /></div>
      <div className="floating-note note-build"><span className="note-icon">{'{ }'}</span><span>BUILD<br /><strong>React Native</strong></span></div>
      <div className="floating-note note-explore"><span className="mini-wave">)))</span><span>EXPLORE<br /><strong>NFC</strong></span></div>
    </div>
  );
}
