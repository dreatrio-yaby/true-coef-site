'use client'

import Logo from '@/components/Logo'

export default function LogoPreview() {
  const variants = ['v1', 'v2', 'v3', 'v4'] as const
  const sizes = [16, 32, 64, 128]

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-black">Варианты логотипа CF</h1>

        {variants.map((variant) => (
          <div key={variant} className="mb-12 p-6 border-2 border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-6 text-black capitalize">
              {variant === 'v1' && 'Вариант 1: Классический с засечками'}
              {variant === 'v2' && 'Вариант 2: Монограмма в круге'}
              {variant === 'v3' && 'Вариант 3: Современный рукописный'}
              {variant === 'v4' && 'Вариант 4: Геометрический в квадрате'}
            </h2>

            <div className="flex gap-8 items-end mb-8">
              {sizes.map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <div className="p-4 bg-white border border-gray-300 rounded">
                    <Logo variant={variant} size={size} className="text-black" />
                  </div>
                  <span className="text-sm text-gray-600">{size}px</span>
                </div>
              ))}
            </div>

            {/* На темном фоне */}
            <div className="bg-gray-900 p-6 rounded-lg">
              <p className="text-white text-sm mb-4">На темном фоне:</p>
              <div className="flex gap-8 items-end">
                {sizes.map((size) => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <div className="p-4 bg-gray-800 border border-gray-700 rounded">
                      <Logo variant={variant} size={size} className="text-white" />
                    </div>
                    <span className="text-sm text-gray-400">{size}px</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Сравнение всех вариантов в одном размере */}
        <div className="mt-12 p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-6 text-black">
            Все варианты в размере favicon (32px)
          </h2>
          <div className="flex gap-8 items-center justify-center">
            {variants.map((variant) => (
              <div key={variant} className="flex flex-col items-center gap-2">
                <div className="p-4 bg-white border-2 border-gray-300 rounded">
                  <Logo variant={variant} size={32} className="text-black" />
                </div>
                <span className="text-sm text-gray-600 capitalize">{variant}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
