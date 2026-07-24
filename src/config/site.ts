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
  tagline: "배운 것을 연결하고, 만든 것으로 증명합니다.",
  description: "개발과 데이터에 관한 개인 지식 저장소이자 포트폴리오.",
  interests: ["프론트엔드", "데이터 모델링", "생산성"],
  email: "hello@example.com",
  links: { github: "https://github.com/example" }
};
