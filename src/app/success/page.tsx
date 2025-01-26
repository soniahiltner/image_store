import Link from "next/link"

const SuccessPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-y-10 text-3xl font-bold text-center">
      <div>
        <span className="text-7xl">🎉</span>
        <h1>Thanks for your purchase</h1>
        <Link
          className="text-blue-500 block mt-4"
          href="/">Back to shop</Link>
      </div>
    </div>
  )
}

export default SuccessPage