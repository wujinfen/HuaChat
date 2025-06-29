import { LoaderCircle } from "lucide-react"

const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin w-20 h-20 text-primary" />
    </div>
  )
}

export default PageLoader