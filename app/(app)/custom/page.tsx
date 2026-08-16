import { CustomMatchFlow } from "@/components/custom-match/custom-match-flow"

export const metadata = {
  title: "Custom Match · Matchwise",
}

export default function CustomMatchPage() {
  const forceMock = process.env.FORCE_DEEPSEEK_MOCK === "true"
  const allowClientForce = process.env.ALLOW_CLIENT_FORCE_MOCK === "true"
  return <CustomMatchFlow showMockActive={forceMock} allowClientToggle={allowClientForce} />
}
