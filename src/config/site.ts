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
  description: "A personal knowledge garden and portfolio",
  interests: ["Biostatistics", "Causal Inference", "RWD", "RWE"],
  email: "nmj936@gmail.com",
  links: { github: "https://github.com/MINJIinFrance" }
};
