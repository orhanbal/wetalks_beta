import TagPage from '../../pages/TagPage';
import type { Article } from '../../data/articles';
import type { Series } from '../../data/series';

interface ModernTagPageProps {
  id: string;
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

export default function ModernTagPage(props: ModernTagPageProps) {
  return <TagPage {...props} />;
}
