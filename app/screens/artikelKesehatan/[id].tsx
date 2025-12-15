// app/screens/artikelKesehatan/[id].tsx

import { useLocalSearchParams } from 'expo-router';
import ArticleDetail from './ArticleDetail';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ArticleDetail articleId={id} />;
}