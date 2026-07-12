import React from 'react';

interface BrunchLogoProps {
  className?: string;
  size?: number; // width/height in pixels
}

export const BrunchLogo: React.FC<BrunchLogoProps> = ({ className = '', size = 120 }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`} style={{ width: size, height: size * 1.15 }}>
      <svg
        viewBox="0 0 500 500"
        className="w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Rings */}
        <circle cx="250" cy="250" r="230" stroke="#fe6e00" strokeWidth="6" strokeDasharray="380 40 180 40" strokeLinecap="round" />
        <circle cx="250" cy="250" r="215" stroke="#fe6e00" strokeWidth="2" strokeDasharray="10 5" opacity="0.7" />
        
        {/* Left and Right Framing Accent Swoshes */}
        <path d="M 40 330 Q 150 310 210 330" stroke="#fe6e00" strokeWidth="4" strokeLinecap="round" />
        <path d="M 30 350 Q 120 330 180 350" stroke="#fe6e00" strokeWidth="2.5" strokeLinecap="round" />
        
        <path d="M 460 330 Q 350 310 290 330" stroke="#fe6e00" strokeWidth="4" strokeLinecap="round" />
        <path d="M 470 350 Q 380 330 320 350" stroke="#fe6e00" strokeWidth="2.5" strokeLinecap="round" />

        {/* Central Chef Hat Group */}
        <g id="chef-hat" transform="translate(145, 60)">
          {/* Hat Base & Dome */}
          <path
            d="M 40 120 
               C 10 120, -10 90, 10 60
               C -5 20, 45 -10, 70 20
               C 90 -15, 130 -10, 140 25
               C 165 -10, 215 15, 200 60
               C 220 90, 200 120, 170 120
               Z"
            fill="#791414"
          />
          {/* Hat Band */}
          <path
            d="M 35 120 L 175 120 L 165 145 L 45 145 Z"
            fill="#5a0b0b"
          />
          
          {/* Cutouts for Fork, Knife, Spoon */}
          {/* Fork (Left) */}
          <g transform="translate(60, 40) scale(0.9)">
            {/* Prongs */}
            <path d="M 0 0 L 0 25 M 6 0 L 6 25 M 12 0 L 12 25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M -2 22 L 14 22 C 14 35, -2 35, -2 22 Z" fill="white" />
            {/* Handle */}
            <path d="M 6 30 L 6 75" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Knife (Center) */}
          <g transform="translate(100, 35) scale(0.9)">
            {/* Blade */}
            <path d="M 4 0 C 4 0, 12 10, 12 35 L 4 45 Z" fill="white" />
            {/* Handle */}
            <path d="M 4 45 L 4 80" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Spoon (Right) */}
          <g transform="translate(132, 40) scale(0.9)">
            {/* Bowl */}
            <ellipse cx="6" cy="18" rx="8" ry="14" fill="white" />
            {/* Handle */}
            <path d="M 6 30 L 6 75" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>

        {/* Text Area */}
        {/* BRUNCH */}
        <text
          x="250"
          y="255"
          fontFamily="'Impact', 'Arial Black', sans-serif"
          fontSize="66"
          fontWeight="900"
          fill="#e61a1a"
          textAnchor="middle"
          letterSpacing="4"
        >
          BRUNCH
        </text>

        {/* RESTO-BAR */}
        <text
          x="250"
          y="295"
          fontFamily="'Georgia', serif"
          fontSize="26"
          fontWeight="bold"
          fill="#1c130c"
          textAnchor="middle"
          letterSpacing="2"
        >
          RESTO-BAR
        </text>

        {/* Vip */}
        <text
          x="250"
          y="342"
          fontFamily="'Georgia', serif"
          fontSize="38"
          fontStyle="italic"
          fontWeight="bold"
          fill="#1c130c"
          textAnchor="middle"
        >
          Vip
        </text>

        {/* Three Yellow Stars */}
        <g id="stars" transform="translate(200, 365) scale(1.1)">
          {/* Star 1 */}
          <path d="M 12 2 L 15 9 L 22 9 L 17 14 L 19 21 L 12 17 L 5 21 L 7 14 L 2 9 L 9 9 Z" fill="#fe6e00" />
          {/* Star 2 (Middle, slightly raised and larger) */}
          <g transform="translate(20, -5) scale(1.15)">
            <path d="M 12 2 L 15 9 L 22 9 L 17 14 L 19 21 L 12 17 L 5 21 L 7 14 L 2 9 L 9 9 Z" fill="#fe6e00" />
          </g>
          {/* Star 3 */}
          <g transform="translate(43, 0)">
            <path d="M 12 2 L 15 9 L 22 9 L 17 14 L 19 21 L 12 17 L 5 21 L 7 14 L 2 9 L 9 9 Z" fill="#fe6e00" />
          </g>
        </g>
      </svg>
    </div>
  );
};
