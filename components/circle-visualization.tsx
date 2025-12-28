"use client"

import { useEffect, useState } from "react"
import type { RoomParticipant } from "@/lib/types"

interface CircleVisualizationProps {
  participants: RoomParticipant[]
  capacity: number
  activeParticipant?: number | null
  locale: "en" | "fa"
}

export function CircleVisualization({ participants, capacity, activeParticipant, locale }: CircleVisualizationProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(true)
  }, [])

  const avatarColors = [
    "#3B82F6", // blue-500
    "#A855F7", // purple-500
    "#EC4899", // pink-500
    "#F43F5E", // rose-500
    "#F97316", // orange-500
    "#F59E0B", // amber-500
    "#84CC16", // lime-500
    "#10B981", // emerald-500
    "#06B6D4", // cyan-500
    "#6366F1", // indigo-500
  ]

  const getAvatarColor = (number: number) => {
    return avatarColors[(number - 1) % avatarColors.length]
  }

  const activeParticipants = participants.filter((p) => p.is_active)
  const participantCount = activeParticipants.length

  const positions = activeParticipants.map((p, i) => {
    const angle = (i * 2 * Math.PI) / Math.max(participantCount, 1) - Math.PI / 2
    const radius = 120
    const x = 160 + radius * Math.cos(angle)
    const y = 160 + radius * Math.sin(angle)
    return { x, y, number: p.participant_number }
  })

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      <svg viewBox="0 0 320 320" className="w-full h-full">
        {/* Warm center circle with cozy gradient */}
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF4E6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFE0B2" stopOpacity="0.1" />
          </radialGradient>

          <g id="personAvatar">
            {/* Head */}
            <circle cx="0" cy="-8" r="6" fill="currentColor" />
            {/* Body */}
            <ellipse cx="0" cy="2" rx="7" ry="9" fill="currentColor" opacity="0.9" />
            {/* Arms */}
            <line x1="-7" y1="0" x2="-11" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="7" y1="0" x2="11" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </defs>

        {/* Center warm circle */}
        <circle cx="160" cy="160" r="70" fill="url(#centerGlow)" />
        <circle
          cx="160"
          cy="160"
          r="55"
          fill="none"
          stroke="#D4A574"
          strokeWidth="2"
          strokeDasharray="4 6"
          opacity="0.5"
        />

        {/* Center text */}
        <text x="160" y="165" textAnchor="middle" className="text-sm font-medium" fontSize="13" fill="#8B7355">
          {locale === "en" ? "Safe Circle" : "دایره امن"}
        </text>

        {positions.map(({ x, y, number }) => {
          const isActive = activeParticipant === number
          const color = getAvatarColor(number)

          return (
            <g key={number} className={animated ? "transition-all duration-700 ease-out" : ""}>
              {/* Chair base - subtle */}
              <rect x={x - 12} y={y + 12} width="24" height="4" rx="2" fill="#D4A574" opacity="0.3" />

              {/* Connection to center - warm dotted line */}
              <line
                x1="160"
                y1="160"
                x2={x}
                y2={y}
                stroke="#D4A574"
                strokeWidth="1.5"
                strokeDasharray="3 4"
                opacity="0.25"
              />

              {isActive && (
                <>
                  <circle cx={x} cy={y} r="28" fill={color} opacity="0.15">
                    <animate attributeName="r" values="28;35;28" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.15;0.05;0.15" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  {/* Speaking waves */}
                  <circle cx={x} cy={y} r="25" fill="none" stroke={color} strokeWidth="2.5" opacity="0.6">
                    <animate attributeName="r" from="25" to="40" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r="25" fill="none" stroke={color} strokeWidth="2" opacity="0.4">
                    <animate attributeName="r" from="25" to="45" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
                    <animate
                      attributeName="opacity"
                      from="0.4"
                      to="0"
                      dur="1.2s"
                      begin="0.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}

              <g
                transform={`translate(${x}, ${y}) scale(${isActive ? 1.15 : 1})`}
                className={isActive ? "transition-transform duration-300" : ""}
              >
                {/* Chair back */}
                <rect x="-10" y="-5" width="20" height="3" rx="1.5" fill="#8B7355" opacity="0.4" />

                {/* Person avatar */}
                <use
                  href="#personAvatar"
                  color={color}
                  style={{
                    filter: isActive ? `drop-shadow(0 0 8px ${color})` : "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
                  }}
                >
                  {isActive && (
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="0,0; 0,-2; 0,0"
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                  )}
                </use>

                {/* Number badge below person */}
                <circle cx="0" cy="18" r="10" fill="white" stroke={color} strokeWidth="2" />
                <text x="0" y="22" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color}>
                  {number}
                </text>
              </g>
            </g>
          )
        })}

        {participantCount === 0 && (
          <g>
            <text x="160" y="195" textAnchor="middle" className="text-sm" fontSize="13" fill="#8B7355" opacity="0.7">
              {locale === "en" ? "Join to start" : "برای شروع بپیوندید"}
            </text>
            <text x="160" y="210" textAnchor="middle" className="text-xs" fontSize="11" fill="#8B7355" opacity="0.5">
              {locale === "en" ? "Your safe space awaits" : "فضای امن شما در انتظار است"}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
