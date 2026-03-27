export default function Footer() {
  return (
    <footer className="w-full border-t border-sky-100 bg-sky-50 text-slate-700">
      <div className="mx-auto max-w-5xl px-4 py-4 text-sm">
        <p className="leading-relaxed">
          © {new Date().getFullYear()} Dijital Dost. Güvenliğiniz için.
        </p>
      </div>
    </footer>
  )
}

