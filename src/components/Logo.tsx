/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "w-12 h-12" }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`${className} select-none`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left side of heart (Navy Blue human body) */}
      <path 
        d="M 100 160 C 55 130 35 95 35 65 C 35 45 48 32 68 32 C 80 32 91 38 96 48" 
        stroke="#0F3A60" 
        strokeWidth="16" 
        strokeLinecap="round" 
      />
      {/* Left head (Navy Blue circle) */}
      <circle cx="68" cy="12" r="11" fill="#0F3A60" />

      {/* Right side of heart (Emerald Green body) */}
      <path 
        d="M 100 160 C 145 130 165 95 165 65 C 165 45 152 32 132 32 C 120 32 109 38 104 48" 
        stroke="#10B981" 
        strokeWidth="16" 
        strokeLinecap="round" 
      />
      
      {/* Stem and Leaf on the right side */}
      <path 
        d="M 132 32 C 132 12 145 2 158 2 C 158 18 145 32 132 32 Z" 
        fill="#10B981" 
      />
      <path 
        d="M 132 32 Q 140 18 152 10" 
        stroke="#069363" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />

      {/* Center Medical Cross (Bold emerald green +) */}
      <path 
        d="M 82 100 L 118 100 M 100 82 L 100 118" 
        stroke="#059669" 
        strokeWidth="12" 
        strokeLinecap="round" 
      />

      {/* Heartbeat/Pulse line in bottom-right */}
      <path 
        d="M 130 165 L 144 165 L 149 148 L 154 182 L 160 158 L 165 172 L 170 165 L 185 165" 
        stroke="#10B981" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
