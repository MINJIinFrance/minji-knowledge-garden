export interface SiteConfig {
  name: string;
  title: string;
  tagline: string;
  description: string;
  interests: string[];
  email: string;
  links: { github: string; linkedin?: string };
}

export const siteConfig: SiteConfig = {
  name: "Minji",
  title: "minji.log",
  tagline: "Learn. Connect. Create. Prove",
  description: "개발과 데이터에 관한 개인 지식 저장소이자 포트폴리오.",
  interests: ["Biostatistics", "Causal Inference", "RWD", "RWE"],
  email: "nmj936@gmail.com",
  links: { github: "https://github.com/MINJIinFrance" }
};
