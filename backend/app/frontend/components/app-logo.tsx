import AppLogoIcon from "./app-logo-icon"

export default function AppLogo() {
  return (
    <>
      <div className="flex aspect-square size-10 items-center justify-center">
        <AppLogoIcon className="size-8" />
      </div>
      <div className="grid flex-1 text-left text-sm">
        <span className="font-semibold">JotChain</span>
      </div>
    </>
  )
}
