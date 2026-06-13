import AuthorPage from '../../pages/AuthorPage';
import type { Article } from '../../data/articles';
import type { Series } from '../../data/series';

interface ModernAuthorPageProps {
  id: string;
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

export default function ModernAuthorPage(props: ModernAuthorPageProps) {
  return <AuthorPage {...props} />;
}
