"use client";

import { motion } from "framer-motion";

interface Props {
  className?: string;
}

/* ─────────────────────────────────────────────────────────────────
   All paths drawn in a 320 × 395 viewBox.
   The bird soars from lower-left (tail/cityscape) to upper-right (beak).
   Rainbow gradient: bottom = pink/magenta, top = blue/teal.
───────────────────────────────────────────────────────────────── */

export default function KothayJaboBird({ className }: Props) {
  return (
    <svg
      viewBox="0 0 320 395"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        {/* ── Main rainbow gradient (vertical: bottom=pink → top=blue) ── */}
        <linearGradient id="kjb-main" x1="0" y1="395" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#E91E8C" />
          <stop offset="16%"  stopColor="#FF3D20" />
          <stop offset="33%"  stopColor="#FF8C00" />
          <stop offset="50%"  stopColor="#FFD000" />
          <stop offset="67%"  stopColor="#7DC400" />
          <stop offset="83%"  stopColor="#00B4A0" />
          <stop offset="100%" stopColor="#0082C8" />
        </linearGradient>

        {/* ── Left-wing gradient (horizontal: body=orange → tip=purple) ── */}
        <linearGradient id="kjb-lwing" x1="116" y1="0" x2="12" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FF8C00" />
          <stop offset="52%"  stopColor="#E84377" />
          <stop offset="100%" stopColor="#9B27AF" />
        </linearGradient>

        {/* ── Mosque dome gradient ── */}
        <radialGradient id="kjb-dome" cx="50%" cy="28%" r="68%">
          <stop offset="0%"   stopColor="#FFE620" />
          <stop offset="62%"  stopColor="#FF9800" />
          <stop offset="100%" stopColor="#E06800" />
        </radialGradient>

        {/* ── Soft glow filter ── */}
        <filter id="kjb-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ─── Ghost building silhouettes (very faint) ─── */}
      <g opacity="0.06" fill="currentColor">
        <rect x="186" y="278" width="22" height="117" />
        <rect x="202" y="258" width="18" height="137" />
        <rect x="218" y="292" width="24" height="103" />
        <rect x="238" y="268" width="16" height="127" />
        <rect x="252" y="250" width="21" height="145" />
        <rect x="268" y="280" width="15" height="115" />
        <rect x="280" y="263" width="19" height="132" />
      </g>

      {/* ─────── BIRD ─────── */}
      <motion.g
        initial={{ opacity: 0, scale: 0.88, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.75, type: "spring", stiffness: 110, damping: 14 }}
        whileHover="flap"
      >
        {/* ── Body ribbon — outer edge (main S-curve from tail to beak) ── */}
        <motion.path
          fill="url(#kjb-main)"
          d="
            M 86,322
            C 78,293 72,264 76,238
            C 80,212 93,189 108,171
            C 121,154 134,139 144,123
            C 154,108 162,92 168,75
            C 174,58 176,43 174,32
            L 196,24
            C 193,38 191,55 186,72
            C 180,90 172,107 162,122
            C 150,139 137,155 124,173
            C 111,191 97,215 93,241
            C 89,267 95,296 103,322
            Z
          "
          filter="url(#kjb-glow)"
        />

        {/* ── Body ribbon — inner highlight (slightly inset for depth) ── */}
        <motion.path
          fill="url(#kjb-main)"
          opacity={0.68}
          d="
            M 95,318
            C 89,290 85,262 89,237
            C 93,212 106,190 120,172
            C 132,156 145,141 154,126
            C 163,111 170,96 174,80
            C 178,64 179,49 177,38
            L 196,30
            C 194,44 192,61 188,78
            C 183,95 176,111 167,126
            C 156,141 143,157 130,175
            C 116,194 102,217 98,242
            C 94,268 99,296 106,320
            Z
          "
        />

        {/* ── Right upper wing — feather 1 (topmost, longest sweep) ── */}
        <motion.path
          fill="url(#kjb-main)"
          d="
            M 156,116
            C 178,94 208,72 240,52
            C 268,34 292,20 308,12
            C 290,28 266,44 240,64
            C 214,82 184,106 162,130
            Z
          "
          variants={{
            flap: { rotate: -5, transition: { repeat: 3, duration: 0.25, repeatType: "mirror" } },
          }}
          style={{ transformOrigin: "156px 120px" }}
        />

        {/* ── Right upper wing — feather 2 ── */}
        <motion.path
          fill="url(#kjb-main)"
          opacity={0.80}
          d="
            M 150,134
            C 173,110 205,86 238,64
            C 268,44 294,28 312,18
            C 293,32 268,50 238,72
            C 208,94 176,118 156,144
            Z
          "
          variants={{
            flap: { rotate: -4, transition: { repeat: 3, duration: 0.25, repeatType: "mirror", delay: 0.04 } },
          }}
          style={{ transformOrigin: "150px 138px" }}
        />

        {/* ── Right upper wing — feather 3 (bottom of right wing group) ── */}
        <motion.path
          fill="url(#kjb-main)"
          opacity={0.60}
          d="
            M 142,152
            C 167,127 200,102 234,80
            C 265,59 292,43 310,34
            C 291,48 265,66 234,88
            C 202,112 169,137 148,163
            Z
          "
          variants={{
            flap: { rotate: -3, transition: { repeat: 3, duration: 0.25, repeatType: "mirror", delay: 0.08 } },
          }}
          style={{ transformOrigin: "142px 156px" }}
        />

        {/* ── Left lower wing — feather 1 (primary) ── */}
        <motion.path
          fill="url(#kjb-lwing)"
          d="
            M 114,182
            C 94,186 74,193 54,203
            C 36,212 22,222 14,230
            C 28,222 46,213 66,205
            C 84,198 104,193 116,188
            Z
          "
          variants={{
            flap: { rotate: 5, transition: { repeat: 3, duration: 0.25, repeatType: "mirror" } },
          }}
          style={{ transformOrigin: "114px 186px" }}
        />

        {/* ── Left lower wing — feather 2 ── */}
        <motion.path
          fill="url(#kjb-lwing)"
          opacity={0.70}
          d="
            M 110,200
            C 90,205 70,213 50,224
            C 32,234 18,245 12,253
            C 26,245 44,235 62,226
            C 80,218 100,211 112,205
            Z
          "
          variants={{
            flap: { rotate: 4, transition: { repeat: 3, duration: 0.25, repeatType: "mirror", delay: 0.06 } },
          }}
          style={{ transformOrigin: "110px 204px" }}
        />

        {/* ── Head / neck extension to beak ── */}
        <motion.path
          fill="url(#kjb-main)"
          d="
            M 174,42
            C 186,28 202,16 220,8
            C 210,22 196,34 183,48
            Z
          "
        />

        {/* ── Tail fade flowing toward cityscape ── */}
        <motion.path
          fill="url(#kjb-main)"
          opacity={0.40}
          d="
            M 82,328
            C 86,342 88,356 88,368
            C 84,357 80,344 80,334
            Z
          "
        />
      </motion.g>

      {/* ─────── CITYSCAPE ─────── */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.55 }}
      >
        {/* Rainbow flow connecting bird tail to city */}
        <path
          fill="url(#kjb-main)"
          opacity="0.26"
          d="M 66,360 C 77,355 92,352 107,355 C 120,358 131,363 140,360 C 128,365 115,368 101,364 C 87,360 74,362 66,364 Z"
        />

        {/* Mosque — base wall */}
        <rect x="68" y="352" width="44" height="38" rx="2.5" fill="#D4820E" />

        {/* Mosque — main dome */}
        <path d="M 68,352 C 68,327 112,327 112,352 Z" fill="url(#kjb-dome)" />

        {/* Mosque — inner dome highlight */}
        <path d="M 76,352 C 76,338 104,338 104,352 Z" fill="#FFDE00" opacity="0.52" />

        {/* Mosque — finial + crescent */}
        <line x1="90" y1="327" x2="90" y2="318" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="90" cy="316" r="3.2" fill="#FFD700" />

        {/* Mosque — arched windows */}
        <rect x="74" y="358" width="9" height="13" rx="4.5" fill="#A85F00" opacity="0.50" />
        <rect x="90" y="358" width="9" height="13" rx="4.5" fill="#A85F00" opacity="0.50" />

        {/* Minaret — shaft */}
        <rect x="116" y="320" width="14" height="60" rx="1.5" fill="#C87812" />

        {/* Minaret — pointed top */}
        <polygon points="116,320 130,320 123,304" fill="#E08012" />
        <line x1="123" y1="304" x2="123" y2="295" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        <circle cx="123" cy="293" r="2.8" fill="#FFD700" />

        {/* Minaret — decorative balcony band */}
        <rect x="114" y="338" width="18" height="4" rx="2" fill="#B06010" />

        {/* Tree — trunk */}
        <rect x="51" y="370" width="7" height="22" rx="1.5" fill="#6B4F12" />

        {/* Tree — foliage layers */}
        <ellipse cx="54.5" cy="360" rx="18" ry="16" fill="#2E8B57" />
        <ellipse cx="46" cy="366" rx="13" ry="11" fill="#3DB36E" />
        <ellipse cx="64" cy="364" rx="11" ry="10" fill="#268F50" />
        <ellipse cx="54.5" cy="352" rx="11" ry="9" fill="#3CAF6A" />
      </motion.g>
    </svg>
  );
}
