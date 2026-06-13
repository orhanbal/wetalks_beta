import IceriklerPage from '../../pages/IceriklerPage';
import type { Article } from '../../data/articles';
import type { Series } from '../../data/series';

interface ModernContentsPageProps {
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

export default function ModernContentsPage(props: ModernContentsPageProps) {
  return <IceriklerPage {...props} />;
}
