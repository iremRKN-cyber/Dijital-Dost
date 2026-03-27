import { useState } from 'react'
import logo from '../assets/logo.png.jpeg'

export default function Header() {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <header className="w-full bg-sky-600 text-white border-b border-sky-200">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!logoFailed ? (
            <img
              src={logo}
              alt="Dijital Dost logosu"
              className="h-14 w-14 rounded-2xl shadow-md p-0 object-contain bg-transparent"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-white/15 flex items-center justify-center font-extrabold shadow-sm">
              DD
            </div>
          )}

          <div className="flex flex-col justify-center">
            <h1 className="text-xl sm:text-2xl font-extrabold leading-tight">
              Dijital Dost
            </h1>
            <p className="text-white/95 text-sm sm:text-base font-semibold leading-snug">
              Güvenilir Siber Dostunuz
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

