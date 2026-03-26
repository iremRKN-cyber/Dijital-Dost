import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import MainContent from './components/MainContent.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-800">
      <Header />
      <MainContent />
      <Footer />
    </div>
  )
}

