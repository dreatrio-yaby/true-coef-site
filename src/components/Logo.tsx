import React from 'react'

interface LogoProps {
  variant?: 'v1' | 'v2' | 'v3' | 'v4'
  size?: number
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'v1',
  size = 32,
  className = ''
}) => {
  const variants = {
    // Вариант 1: Простые строчные буквы с засечками
    v1: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <text
          x="50"
          y="70"
          fontSize="70"
          fontFamily="Georgia, serif"
          fontWeight="400"
          textAnchor="middle"
          fill="currentColor"
        >
          cf
        </text>
      </svg>
    ),

    // Вариант 2: Монограмма - буквы в круге
    v2: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <text
          x="50"
          y="68"
          fontSize="50"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="600"
          textAnchor="middle"
          fill="currentColor"
        >
          cf
        </text>
      </svg>
    ),

    // Вариант 3: Современный sans-serif с лигатурой
    v3: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* c */}
        <path
          d="M 32 35 Q 20 35 20 50 Q 20 65 32 65 Q 38 65 42 60"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        {/* f */}
        <path
          d="M 55 65 L 55 38 Q 55 30 62 30 L 70 30 M 48 45 L 65 45"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),

    // Вариант 4: Геометрический в квадрате
    v4: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="16"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <text
          x="50"
          y="68"
          fontSize="48"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          textAnchor="middle"
          fill="currentColor"
        >
          cf
        </text>
      </svg>
    ),
  }

  return variants[variant]
}

export default Logo
