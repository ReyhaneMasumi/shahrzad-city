export interface SectionHeadProps {
  title: string;
  href?: string;
  onAction?: () => void;
  actionLabel?: string;
  headingLevel?: 2 | 3;
}
