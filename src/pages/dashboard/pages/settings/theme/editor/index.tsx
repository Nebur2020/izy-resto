import { useSettings } from '../../../../../../hooks';
import PizzaThemeEditor, { defaultConfig, PizzaThemeConfig } from './pizza';

type EditorProps = {
  theme: 'pizza' | 'modern' | 'minimal' | 'grid';
};

const Editor = ({ theme }: EditorProps) => {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

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
      themes: {
        pizza: data.configuration,
      },
    });
  };

  switch (theme) {
    case 'pizza':
      return (
        <PizzaThemeEditor
          config={
            Object.keys(settings.activeTheme?.configuration || {}).length > 0
              ? (settings.activeTheme.configuration as PizzaThemeConfig)
              : settings.themes[theme] || defaultConfig
          }
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
