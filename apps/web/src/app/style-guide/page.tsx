import { notFound } from "next/navigation";
import StyleGuideContent from "./style-guide-content";

export const metadata = {
  title: "Design System & Style Guide | PresentMam",
  description: "Dev-only design tokens, typography, glass depths, and button variants",
};

export default function StyleGuidePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <StyleGuideContent />;
}
