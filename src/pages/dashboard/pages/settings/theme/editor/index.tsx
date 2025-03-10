import { useSettings } from '../../../../../../hooks';
import PizzaThemeEditor, { PizzaThemeConfig } from './pizza';

type EditorProps = {
  theme: 'pizza' | 'modern' | 'minimal' | 'grid';
};

type EditorData = {
  pizza: PizzaThemeConfig;
};

const Editor = ({ theme }: EditorProps) => {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

  console.log(
    'settings.activeTheme.configuration',
    settings.activeTheme.configuration
  );

  const onSave = async (data: {
    key: 'pizza';
    configuration: PizzaThemeConfig;
  }) => {
    await updateSettings({
      ...settings,
      activeTheme: {
        key: data.key,
        configuration: data.configuration,
      },
    });
    console.log('Saved', data);
  };

  switch (theme) {
    case 'pizza':
      return (
        <PizzaThemeEditor
          config={settings.activeTheme.configuration as PizzaThemeConfig}
          onSave={onSave}
        />
      );
    case 'modern':
      return <div>modern Editor</div>;
    case 'minimal':
      return <div>minimal Editor</div>;
    case 'grid':
      return <div>grid Editor</div>;
  }

  return <div>Not found</div>;
};

export default Editor;
