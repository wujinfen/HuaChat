import { LoaderCircle } from "lucide-react"
import { useThemeStore } from "../store/useThemeStore.js"

const PageLoader = () => {
  const { theme } = useThemeStore();

  return (
    <div className="min-h-screen flex items-center justify-center" data-theme={theme}>
        <LoaderCircle className="animate-spin w-20 h-20 text-primary" />
    </div>
  )
}

export default PageLoader