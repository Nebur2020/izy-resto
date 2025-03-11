import { useParams } from 'react-router-dom';
import Editor from './editor';

const ThemePage = () => {
  const params = useParams<{ theme: 'pizza' }>();

  if (!params.theme) return null;

  return <Editor theme={params.theme} />;
};

export default ThemePage;
