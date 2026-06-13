import HomePage from '../../pages/HomePage';
import type { Article } from '../../data/articles';
import type { Series } from '../../data/series';

interface ModernHomePageProps {
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
  settings: Record<string, string>;
}

export default function ModernHomePage(props: ModernHomePageProps) {
  return <HomePage {...props} />;
}
